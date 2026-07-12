import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import axiosInstance from "axios";
import {
  Package,
  FileText,
  Layers,
  DollarSign,
  CheckCircle,
  XCircle,
  Palette,
  Image,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
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
  colors: Yup.array()
    .of(
      Yup.object().shape({
        color: Yup.string().required("Color name/code is required"),
        image: Yup.mixed().required("Image file or URL is required"), // تم تعديله ليقبل الملفات أو الروابط النصية القديمة
        inStock: Yup.boolean(),
      }),
    )
    .min(1, "At least one color variant is required"),
  availableWeights: Yup.array().of(Yup.string()),

  availableLengths: Yup.array().of(Yup.string()),
});

const UpdateProductForm = () => {
  const weightOptions = [
    "one size",
    "50-80 kg",
    "80-120 kg",
    "Up to 80 kg (Bust: 105)",
    "Up to 110 kg (Bust: 120)",
    "Up to 110 kg",
  ];

  const lengthOptions = ["100", "105", "110", "150"];

  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // 1. جلب بيانات المنتج الحالية فور تحميل الصفحة
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const { data } = await axiosInstance.get(`${baseUrl}/products/${id}`);

        // تعيين القيم القادمة وتحديث هيكل مصفوفة الألوان
        setInitialValues({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "",
          price: data.price || "",
          inStock: data.inStock ?? true,
          availableWeights: data.availableWeights || [],
          availableLengths: data.availableLengths || [],

          colors:
            data.colors && data.colors.length > 0
              ? data.colors.map((c) => ({
                  color: c.color || "",
                  image: c.image || "", // الروابط النصية القديمة هتنزل هنا عادي
                  inStock: c.inStock ?? true,
                }))
              : [{ color: "", image: null, inStock: true }],
        });
      } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Failed to load product details. Returning to dashboard.");
        navigate("/admin/products");
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProductDetails();
  }, [id, navigate]);

  // 2. معالجة إرسال البيانات المحدثة بالسيرفر
  const handleUpdateSubmit = async (values, { setSubmitting }) => {
    try {
      // رفع الصور الجديدة فقط التي تم تعديلها كملف (File Object)
      const uploadedColors = await Promise.all(
        values.colors.map(async (colorItem) => {
          // لو حقل الصورة عبارة عن Object (ملف جديد) وليس String (رابط قديم)
          if (colorItem.image && typeof colorItem.image !== "string") {
            const formData = new FormData();
            formData.append("file", colorItem.image);
            formData.append(
              "upload_preset",
              import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
                "YOUR_UPLOAD_PRESET",
            );

            // نستخدم axios القياسي لرفع الصور لـ Cloudinary لتفادي تداخل الـ interceptors
            const cloudinaryResponse = await axios.post(
              `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME"}/image/upload`,
              formData,
            );

            return {
              ...colorItem,
              image: cloudinaryResponse.data.secure_url, // استبدال الملف برابط Cloudinary
            };
          }
          // لو الصورة مفيهاش تعديل وهي عبارة عن String (الرابط القديم) سيبها زي ما هي
          return colorItem;
        }),
      );

      const finalValues = {
        ...values,
        colors: uploadedColors,
      };

      await axiosInstance.put(`${baseUrl}/products/${id}`, finalValues);
      alert("Product updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error updating product:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong while updating. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-sm font-medium">Fetching product data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100">
      {/* رأس الصفحة مع زر العودة للرئيسية */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Update Product
            </h2>
            <p className="text-sm text-slate-400">
              Modify the fields below to patch your live product metadata.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={ProductValidationSchema}
        onSubmit={handleUpdateSubmit}
        enableReinitialize={true}
      >
        {(
          { values, isSubmitting, errors, touched, setFieldValue }, // تم تفكيك setFieldValue هنا
        ) => (
          <Form className="space-y-6">
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" /> Product Name
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder="e.g. Wireless Ergonomic Mouse"
                  className={`px-4 py-2.5 rounded-xl border  bg-slate-50/50 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.name && touched.name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                  }`}
                />
                <ErrorMessage
                  name="name"
                  component="span"
                  className="text-xs font-medium text-red-500 mt-1"
                />
              </div>

              {/* Category */}
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
                  <option value="" disabled hidden>
                    Select a category
                  </option>
                  <option value="Sets">Sets</option>
                  <option value="Skirts">Skirts</option>
                  <option value="Blouses">Blouses</option>
                  <option value="Abaya">Abaya</option>
                  <option value="Soiree">Soiree</option>
                </Field>
                <ErrorMessage
                  name="category"
                  component="span"
                  className="text-xs font-medium text-red-500 mt-1"
                />
              </div>

              {/* Available Weights */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Available Weights
                </label>

                <FieldArray name="availableWeights">
                  {({ push, remove }) => (
                    <div className="grid grid-cols-1 gap-2">
                      {weightOptions.map((weight) => (
                        <label
                          key={weight}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={(values.availableWeights || []).includes(
                              weight,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                push(weight);
                              } else {
                                remove(values.availableWeights.indexOf(weight));
                              }
                            }}
                          />
                          {weight}
                        </label>
                      ))}
                    </div>
                  )}
                </FieldArray>

                <ErrorMessage
                  name="availableWeights"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>

              {/* Available Lengths */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">
                  Available Lengths
                </label>

                <FieldArray name="availableLengths">
                  {({ push, remove }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {lengthOptions.map((length) => (
                        <label
                          key={length}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={(values.availableLengths || []).includes(
                              length,
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                push(length);
                              } else {
                                remove(values.availableLengths.indexOf(length));
                              }
                            }}
                          />
                          {length}
                        </label>
                      ))}
                    </div>
                  )}
                </FieldArray>

                <ErrorMessage
                  name="availableLengths"
                  component="span"
                  className="text-xs text-red-500"
                />
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" /> Price (EGP)
                </label>
                <Field
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`px-4 py-2.5 rounded-xl border bg-slate-50/50 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.price && touched.price
                      ? "border-red-400 focus:ring-red-200"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                  }`}
                />
                <ErrorMessage
                  name="price"
                  component="span"
                  className="text-xs font-medium text-red-500 mt-1"
                />
              </div>

              {/* Stock Status Toggle */}
              <div className="flex flex-col gap-1.5 justify-center">
                <span className="text-sm font-semibold text-slate-700 mb-2 block">
                  Availability Status
                </span>
                <label className="inline-flex items-center cursor-pointer select-none">
                  <Field
                    type="checkbox"
                    name="inStock"
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ms-3 text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    {values.inStock ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> In Stock
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Sold out
                      </span>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" /> Description
              </label>
              <Field
                name="description"
                as="textarea"
                rows="4"
                placeholder="Write a compelling product description..."
                className={`px-4 py-2.5 rounded-xl border bg-slate-50/50 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
                  errors.description && touched.description
                    ? "border-red-400 focus:ring-red-200"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                }`}
              />
              <ErrorMessage
                name="description"
                component="span"
                className="text-xs font-medium text-red-500 mt-1"
              />
            </div>

            <hr className="my-6 border-slate-50" />

            {/* Dynamic Colors & Images Array */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-bold text-slate-800">
                    Color Variants
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manage your existing color blocks, picture endpoints, and
                    their stock status.
                  </p>
                </div>
                {typeof errors.colors === "string" && (
                  <span className="text-xs font-medium text-red-500">
                    {errors.colors}
                  </span>
                )}
              </div>

              <FieldArray name="colors">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    {values.colors.map((colorItem, index) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-slate-50/40 rounded-2xl border border-slate-100 relative group"
                      >
                        {/* Variant Color String */}
                        <div className="flex-1 w-full flex flex-col gap-1.5">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Palette className="w-4 h-4 text-slate-400" />
                            </span>
                            <Field
                              name={`colors.${index}.color`}
                              type="text"
                              placeholder="Color name (e.g., Matte Black)"
                              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
                            />
                          </div>
                          <ErrorMessage
                            name={`colors.${index}.color`}
                            component="span"
                            className="text-xs font-medium text-red-500"
                          />
                        </div>

                        {/* Variant Image File / URL Input - التعديل الجديد هنا للتعديل الذكي للصور */}
                        <div className="flex-[2] w-full flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-sm text-slate-600 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-colors">
                                <Image className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <span className="truncate max-w-[180px]">
                                  {values.colors[index].image
                                    ? typeof values.colors[index].image ===
                                      "string"
                                      ? "Existing Image"
                                      : values.colors[index].image.name ||
                                        "Image Selected"
                                    : "Upload New Image"}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    setFieldValue(
                                      `colors.${index}.image`,
                                      file || null,
                                    );
                                  }}
                                />
                              </label>
                            </div>

                            {/* مربع معاينة الصور (Preview) بيشتغل مع روابط الـ DB أو الملفات المحلية */}
                            {values.colors[index].image && (
                              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                                <img
                                  src={
                                    typeof values.colors[index].image ===
                                    "string"
                                      ? values.colors[index].image // لو لينك مخزن في الداتا بيز
                                      : URL.createObjectURL(
                                          values.colors[index].image,
                                        ) // لو ملف لسه مرفوع
                                  }
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                          <ErrorMessage
                            name={`colors.${index}.image`}
                            component="span"
                            className="text-xs font-medium text-red-500"
                          />
                        </div>

                        {/* Color Specific Stock Toggle */}
                        <div className="flex items-center gap-2 min-w-[120px] self-center pt-2 md:pt-0">
                          <label className="inline-flex items-center cursor-pointer select-none">
                            <Field
                              type="checkbox"
                              name={`colors.${index}.inStock`}
                              className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ms-2 text-xs font-medium text-slate-600">
                              {colorItem.inStock ? "In Stock" : "OOS"}
                            </span>
                          </label>
                        </div>

                        {/* Remove Variant Button */}
                        {values.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors md:self-center self-end mt-2 md:mt-0"
                            title="Remove variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        push({ color: "", image: null, inStock: true })
                      } // تعديل القيمة الابتدائية لـ null لتجنب مشاكل التحقق
                      className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:bg-indigo-50/10"
                    >
                      <Plus className="w-4 h-4" /> Add Color Variant
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Submit Updates Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-100 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Updating
                    Product...
                  </>
                ) : (
                  "Save Changes"
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
