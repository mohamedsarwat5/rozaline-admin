import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  Package,
  FileText,
  Layers,
  DollarSign,
  CheckCircle,
  XCircle,
  Palette,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Sparkles,
  Flame,
} from "lucide-react";

const baseUrl = import.meta.env.VITE_BASE_URL;

// مخطط التحقق (Validation Schema)
const ProductValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required("Product name is required"),
  description: Yup.string().trim().required("Description is required"),
  category: Yup.string().trim().required("Category is required"),
  price: Yup.number()
    .positive("Price must be positive")
    .required("Price is required"),
  inStock: Yup.boolean(),
  newArrival: Yup.boolean(),
  bestSeller: Yup.boolean(),
  colors: Yup.array()
    .of(
      Yup.object().shape({
        color: Yup.string().required("Color name/code is required"),
        image: Yup.mixed().required("Image is required"),
        inStock: Yup.boolean(),
      })
    )
    .min(1, "At least one color variant is required"),
  availableWeights: Yup.array().of(Yup.string()),
  availableLengths: Yup.array().of(Yup.string()),
});

const UpdateProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const weightOptions = [
    "one size",
    "50-80 kg",
    "80-120 kg",
    "Up to 80 kg (Bust: 105)",
    "Up to 110 kg (Bust: 120)",
    "Up to 110 kg",
  ];

  const lengthOptions = ["100", "105", "110", "150"];

  // جلب بيانات المنتج عند فتح الصفحة عبر axios المباشر لضمان عدم تعطل المسار
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${baseUrl}/products/${id}`);
        const enrichedColors = response.data.colors?.map(c => ({
          ...c,
          isCompressing: false
        })) || [];

        setProductData({
          ...response.data,
          colors: enrichedColors
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to load product data.");
        navigate(-1);
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // دالة ضغط الصور الآمنة للموبايل (Canvas)
  const compressImageForMobile = (file, maxWidth = 1200, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = objectUrl;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(objectUrl);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error("Canvas conversion failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      };
    });
  };

  // معالجة تحديث بيانات المنتج (PUT)
  const handleUpdateSubmit = async (values, { setSubmitting }) => {
    const checkingCompression = values.colors.some(c => c.isCompressing);
    if (checkingCompression) {
      alert("Please wait until image compression is finished.");
      setSubmitting(false);
      return;
    }

    try {
      const uploadedColors = await Promise.all(
        values.colors.map(async (colorItem) => {
          if (colorItem.image instanceof File) {
            const formData = new FormData();
            formData.append("file", colorItem.image);
            formData.append(
              "upload_preset",
              import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "YOUR_UPLOAD_PRESET"
            );

            const cloudinaryResponse = await axios.post(
              `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME"}/image/upload`,
              formData
            );

            return {
              color: colorItem.color,
              inStock: colorItem.inStock,
              image: cloudinaryResponse.data.secure_url,
            };
          }

          return {
            color: colorItem.color,
            inStock: colorItem.inStock,
            image: colorItem.image
          };
        })
      );

      const finalColors = uploadedColors.map(({ color, image, inStock }) => ({ color, image, inStock }));

      const finalValues = {
        ...values,
        colors: finalColors,
      };

      await axios.put(`${baseUrl}/products/${id}`, finalValues);
      alert("Product updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error updating product:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong while updating the product."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Update Product
            </h2>
            <p className="text-sm text-slate-400">
              Modify the existing product parameters and variations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>

      <Formik
        initialValues={{
          name: productData?.name || "",
          description: productData?.description || "",
          category: productData?.category || "",
          price: productData?.price || "",
          inStock: productData?.inStock ?? true,
          newArrival: productData?.newArrival ?? false,
          bestSeller: productData?.bestSeller ?? false,
          availableWeights: productData?.availableWeights || [],
          availableLengths: productData?.availableLengths || [],
          colors: productData?.colors || [{ color: "", image: null, inStock: true, isCompressing: false }],
        }}
        validationSchema={ProductValidationSchema}
        onSubmit={handleUpdateSubmit}
        enableReinitialize={true}
      >
        {({ values, isSubmitting, errors, touched, setFieldValue }) => (
          <Form className="space-y-6">
            {/* شبكة البيانات الأساسية */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* اسم المنتج */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" /> Product Name
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder="e.g. Elegant Evening Dress"
                  className={`px-4 py-2.5 rounded-xl border bg-slate-50/50 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.name && touched.name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                  }`}
                />
                <ErrorMessage name="name" component="span" className="text-xs font-medium text-red-500 mt-1" />
              </div>

              {/* الفئة */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" /> Category
                </label>
                <Field
                  name="category"
                  as="select"
                  className={`px-4 py-2.5 rounded-xl border bg-slate-50/50 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.category && touched.category
                      ? "border-red-400 focus:ring-red-200"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                  }`}
                >
                  <option value="" disabled hidden>Select a category</option>
                  <option value="Sets">Sets</option>
                  <option value="Skirts">Skirts</option>
                  <option value="Blouses">Blouses</option>
                  <option value="Abaya">Abaya</option>
                  <option value="Soirée">Soirée</option>
                  <option value="Dresses">Dresses</option>
                </Field>
                <ErrorMessage name="category" component="span" className="text-xs font-medium text-red-500 mt-1" />
              </div>

              {/* الأوزان المتاحة */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Available Weights</label>
                <FieldArray name="availableWeights">
                  {({ push, remove }) => (
                    <div className="grid grid-cols-1 gap-2">
                      {weightOptions.map((weight) => (
                        <label key={weight} className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={values.availableWeights.includes(weight)}
                            onChange={(e) => {
                              if (e.target.checked) push(weight);
                              else remove(values.availableWeights.indexOf(weight));
                            }}
                            className="w-4 h-4"
                          />
                          {weight}
                        </label>
                      ))}
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* الأطوال المتاحة */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Available Lengths</label>
                <FieldArray name="availableLengths">
                  {({ push, remove }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {lengthOptions.map((length) => (
                        <label key={length} className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={values.availableLengths.includes(length)}
                            onChange={(e) => {
                              if (e.target.checked) push(length);
                              else remove(values.availableLengths.indexOf(length));
                            }}
                            className="w-4 h-4"
                          />
                          {length}
                        </label>
                      ))}
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* السعر */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" /> Price (EGP)
                </label>
                <Field
                  name="price"
                  type="number"
                  placeholder="0.00"
                  className={`px-4 py-2.5 rounded-xl border bg-slate-50/50 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.price && touched.price
                      ? "border-red-400 focus:ring-red-200"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                  }`}
                />
                <ErrorMessage name="price" component="span" className="text-xs font-medium text-red-500 mt-1" />
              </div>

              {/* لوحة الشارات والحالات */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/80">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Availability</span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <Field type="checkbox" name="inStock" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    <span className="ms-3 text-sm font-semibold text-slate-700">
                      {values.inStock ? (
                        <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> In Stock</span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1"><XCircle className="w-4 h-4" /> Out of stock</span>
                      )}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">New Arrival</span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <Field type="checkbox" name="newArrival" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    <span className="ms-3 text-sm font-semibold text-slate-700">
                      {values.newArrival ? (
                        <span className="text-indigo-600 flex items-center gap-1"><Sparkles className="w-4 h-4" /> Active</span>
                      ) : (
                        <span className="text-slate-400">Inactive</span>
                      )}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Best Seller</span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <Field type="checkbox" name="bestSeller" className="sr-only peer" />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    <span className="ms-3 text-sm font-semibold text-slate-700">
                      {values.bestSeller ? (
                        <span className="text-amber-500 flex items-center gap-1"><Flame className="w-4 h-4" /> Active</span>
                      ) : (
                        <span className="text-slate-400">Inactive</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* الوصف */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Description
              </label>
              <Field
                name="description"
                as="textarea"
                rows="4"
                placeholder="Write a comprehensive description here..."
                className={`px-4 py-2.5 rounded-xl border bg-slate-50/50 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.description && touched.description
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                }`}
              />
              <ErrorMessage name="description" component="span" className="text-xs font-medium text-red-500 mt-1" />
            </div>

            <hr className="my-6 border-slate-100" />

            {/* مصفوفة الألوان والصور المتغيرة */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-bold text-slate-800">Color Variants</h3>
                  <p className="text-xs text-slate-400">Modify variants, upload new images or keep existing ones.</p>
                </div>
                {typeof errors.colors === "string" && (
                  <span className="text-xs font-medium text-red-500">{errors.colors}</span>
                )}
              </div>

              <FieldArray name="colors">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.colors.map((colorItem, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-slate-50/40 rounded-2xl border border-slate-100"
                      >
                        {/* اسم اللون */}
                        <div className="flex-1 w-full flex flex-col gap-1.5">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Palette className="w-4 h-4 text-slate-400" />
                            </span>
                            <Field
                              name={`colors.${index}.color`}
                              type="text"
                              placeholder="Color name (e.g. Royal Blue)"
                              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm"
                            />
                          </div>
                          <ErrorMessage name={`colors.${index}.color`} component="span" className="text-xs font-medium text-red-500" />
                        </div>

                        {/* رفع الصورة للمتغير */}
                        <div className="flex-[2] w-full flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <label className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-sm text-slate-600 transition-colors ${values.colors[index].isCompressing ? "opacity-60 pointer-events-none bg-slate-50" : ""}`}>
                                {values.colors[index].isCompressing ? (
                                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin flex-shrink-0" />
                                ) : (
                                  <Package className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                )}
                                <span className="truncate max-w-[180px]">
                                  {values.colors[index].isCompressing
                                    ? "Compressing HD..."
                                    : values.colors[index].image
                                      ? (values.colors[index].image instanceof File
                                        ? values.colors[index].image.name
                                        : "Keep Existing Image")
                                      : "Choose Image"}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={values.colors[index].isCompressing || isSubmitting}
                                  onChange={async (event) => {
                                    const file = event.currentTarget.files?.[0];
                                    if (file) {
                                      try {
                                        setFieldValue(`colors.${index}.isCompressing`, true);
                                        const compressedFile = await compressImageForMobile(file, 1200, 0.75);
                                        setFieldValue(`colors.${index}.image`, compressedFile);
                                        setFieldValue(`colors.${index}.isCompressing`, false);
                                      } catch (compressError) {
                                        console.error("Compression failed:", compressError);
                                        setFieldValue(`colors.${index}.image`, file);
                                        setFieldValue(`colors.${index}.isCompressing`, false);
                                      }
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {/* معاينة الصورة */}
                            {values.colors[index].image && !values.colors[index].isCompressing && (
                              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                                <img
                                  src={
                                    values.colors[index].image instanceof File
                                      ? URL.createObjectURL(values.colors[index].image)
                                      : values.colors[index].image
                                  }
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                          <ErrorMessage name={`colors.${index}.image`} component="span" className="text-xs font-medium text-red-500" />
                        </div>

                        {/* حالة التوفر */}
                        <div className="flex items-center gap-2 min-w-[120px] pt-2 md:pt-0">
                          <label className="inline-flex items-center cursor-pointer select-none">
                            <Field type="checkbox" name={`colors.${index}.inStock`} className="sr-only peer" />
                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                            <span className="ms-2 text-xs font-medium text-slate-600">
                              {colorItem.inStock ? "In Stock" : "OOS"}
                            </span>
                          </label>
                        </div>

                        {/* حذف المتغير */}
                        {values.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors self-end md:self-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => push({ color: "", image: null, inStock: true, isCompressing: false })}
                      className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:bg-indigo-50/10"
                    >
                      <Plus className="w-4 h-4" /> Add Color Variant
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* زر حفظ التعديلات */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || values.colors.some(c => c.isCompressing)}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Updating Product...
                  </>
                ) : values.colors.some(c => c.isCompressing) ? (
                  "Compressing Images..."
                ) : (
                  "Update Product Details"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default UpdateProductForm;