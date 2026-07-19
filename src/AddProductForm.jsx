import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
// استيراد مكتبة ضغط الصور الاحترافية للموبايل
import imageCompression from "browser-image-compression";
import {
  Package,
  FileText,
  Layers,
  DollarSign,
  CheckCircle,
  XCircle,
  Palette,
  Image as ImageIcon,
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
        image: Yup.mixed().required("Image file is required"),
        inStock: Yup.boolean(),
      }),
    )
    .min(1, "At least one color variant is required"),
  availableWeights: Yup.array().of(Yup.string()),
  availableLengths: Yup.array().of(Yup.string()),
});

const AddProductForm = () => {
  const navigate = useNavigate();

  const weightOptions = [
    "one size",
    "50-80 kg",
    "80-120 kg",
    "Up to 80 kg (Bust: 105)",
    "Up to 110 kg (Bust: 120)",
    "Up to 110 kg",
  ];

  const lengthOptions = ["100", "105", "110", "150"];

  const defaultInitialValues = {
    name: "",
    description: "",
    category: "",
    price: "",
    inStock: true,
    newArrival: false,
    bestSeller: false,
    availableWeights: [],
    availableLengths: [],
    colors: [{ color: "", image: null, inStock: true }],
  };

  const handleAddSubmit = async (values, { setSubmitting }) => {
    try {
      const uploadedColors = await Promise.all(
        values.colors.map(async (colorItem) => {
          if (colorItem.image instanceof File) {
            // إعدادات ضغط الصورة للموبايل لتقليل الحجم دون خسارة الجودة
            const options = {
              maxSizeMB: 1, // أقصى حجم للصورة 1 ميجابايت
              maxWidthOrHeight: 1024, // أقصى أبعاد 1024 بكسل
              useWebWorker: true, // تشغيل الضغط في الخلفية لمنع تهنيج المتصفح
              fileType: "image/jpeg",
            };

            // ضغط الصورة باستخدام المكتبة
            const compressedBlob = await imageCompression(
              colorItem.image,
              options,
            );
            const compressedFile = new File(
              [compressedBlob],
              colorItem.image.name,
              {
                type: "image/jpeg",
              },
            );

            const formData = new FormData();
            formData.append("file", compressedFile);
            formData.append(
              "upload_preset",
              import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
            );

            // رفع الصورة المضغوطة إلى Cloudinary
            const cloudinaryResponse = await axios.post(
              `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
              formData,
            );

            return {
              ...colorItem,
              image: cloudinaryResponse.data.secure_url,
            };
          }
          return colorItem;
        }),
      );

      const finalValues = {
        ...values,
        colors: uploadedColors,
      };

      // إرسال البيانات النهائية للسيرفر الخاص بك
      await axios.post(`${baseUrl}/products`, finalValues);
      alert("Product added successfully!");
      navigate("/");
    } catch (error) {
      console.error("Submission error details:", error);
      alert(
        `حدث خطأ أثناء الرفع: ${error.response?.data?.message || error.message || "فشلت العملية"}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex mb-6 items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Add New Product
            </h2>
            <p className="text-sm text-slate-400">
              Fill in the details below to publish a new garment or set to your
              live catalog.
            </p>
          </div>
        </div>
      </div>

      <Formik
        initialValues={defaultInitialValues}
        validationSchema={ProductValidationSchema}
        onSubmit={handleAddSubmit}
      >
        {({
          values,
          isSubmitting,
          errors,
          touched,
          setFieldValue,
          handleSubmit,
        }) => (
          /* استخدام تاغ form العادي وحقن e.preventDefault() بشكل صارم لمنع ريفريش الموبايل */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmit(e);
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
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
                  <option value="Soirée">Soirée</option>
                  <option value="Dresses">Dresses</option>
                </Field>
                <ErrorMessage
                  name="category"
                  component="span"
                  className="text-xs font-medium text-red-500 mt-1"
                />
              </div>

              {/* Weights */}
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
                            checked={values.availableWeights.includes(weight)}
                            onChange={(e) => {
                              if (e.target.checked) push(weight);
                              else
                                remove(values.availableWeights.indexOf(weight));
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

              {/* Lengths */}
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
                            checked={values.availableLengths.includes(length)}
                            onChange={(e) => {
                              if (e.target.checked) push(length);
                              else
                                remove(values.availableLengths.indexOf(length));
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

              {/* Price */}
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
                <ErrorMessage
                  name="price"
                  component="span"
                  className="text-xs font-medium text-red-500 mt-1"
                />
              </div>

              {/* Badges Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:col-span-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/80">
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Availability
                  </span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <Field
                      type="checkbox"
                      name="inStock"
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    <span className="ms-3 text-sm font-semibold text-slate-700">
                      {values.inStock ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> In Stock
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Out of stock
                        </span>
                      )}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    New Arrival
                  </span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <Field
                      type="checkbox"
                      name="newArrival"
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    <span className="ms-3 text-sm font-semibold text-slate-700">
                      {values.newArrival ? (
                        <span className="text-indigo-600 flex items-center gap-1">
                          <Sparkles className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-400">Inactive</span>
                      )}
                    </span>
                  </label>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Best Seller
                  </span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <Field
                      type="checkbox"
                      name="bestSeller"
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    <span className="ms-3 text-sm font-semibold text-slate-700">
                      {values.bestSeller ? (
                        <span className="text-amber-500 flex items-center gap-1">
                          <Flame className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-400">Inactive</span>
                      )}
                    </span>
                  </label>
                </div>
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
                placeholder="Write a product description..."
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

            <hr className="my-6 border-slate-100" />

            {/* Color Variants Matrix */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-bold text-slate-800">
                    Color Variants
                  </h3>
                  <p className="text-xs text-slate-400">
                    Add at least one color shade and upload its picture.
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
                        className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-slate-50/40 rounded-2xl border border-slate-100"
                      >
                        <div className="flex-1 w-full flex flex-col gap-1.5">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Palette className="w-4 h-4 text-slate-400" />
                            </span>
                            <Field
                              name={`colors.${index}.color`}
                              type="text"
                              placeholder="Color (e.g. Royal Blue)"
                              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none text-sm"
                            />
                          </div>
                          <ErrorMessage
                            name={`colors.${index}.color`}
                            component="span"
                            className="text-xs font-medium text-red-500"
                          />
                        </div>

                        <div className="flex-[2] w-full flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <label className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-sm text-slate-600 transition-colors">
                                <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <span className="truncate max-w-[180px]">
                                  {values.colors[index].image
                                    ? values.colors[index].image.name
                                    : "Choose Image"}
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

                            {values.colors[index].image && (
                              <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                                <img
                                  src={URL.createObjectURL(
                                    values.colors[index].image,
                                  )}
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

                        <div className="flex items-center gap-2 min-w-[120px] pt-2 md:pt-0">
                          <label className="inline-flex items-center cursor-pointer select-none">
                            <Field
                              type="checkbox"
                              name={`colors.${index}.inStock`}
                              className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                            <span className="ms-2 text-xs font-medium text-slate-600">
                              {colorItem.inStock ? "In Stock" : "OOS"}
                            </span>
                          </label>
                        </div>

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
                      onClick={() =>
                        push({ color: "", image: null, inStock: true })
                      }
                      className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:bg-indigo-50/10"
                    >
                      <Plus className="w-4 h-4" /> Add Color Variant
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Submit Section */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Publishing
                    Product...
                  </>
                ) : (
                  "Publish Product"
                )}
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default AddProductForm;
