import React from "react";
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
  Image,
  Plus,
  Trash2,
  Loader2,
  Award,       // تم استيراد أيكونة الأكثر مبيعاً
  Sparkles,    // تم استيراد أيكونة المنتجات الجديدة
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.VITE_BASE_URL;

// Validation Schema matching your Mongoose requirements
const ProductValidationSchema = Yup.object().shape({
  name: Yup.string().trim().required("Product name is required"),
  description: Yup.string().trim().required("Description is required"),
  category: Yup.string().trim().required("Category is required"),
  price: Yup.number()
    .positive("Price must be positive")
    .required("Price is required"),
  inStock: Yup.boolean(),
  bestSeller: Yup.boolean(), // تم الإضافة هنا
  newArrival: Yup.boolean(), // تم الإضافة هنا
  colors: Yup.array()
    .of(
      Yup.object().shape({
        color: Yup.string().required("Color name/code is required"),
        image: Yup.mixed().required("Image file is required"),
        inStock: Yup.boolean(),
      }),
    )
    .min(1, "At least one color variant is required"),
  availableWeights: Yup.array()
    .of(Yup.string())
    .min(1, "Select at least one weight"),

  availableLengths: Yup.array()
    .of(Yup.string())
    .min(1, "Select at least one length"),
});

const AddProductForm = () => {
  const weightOptions = [
    "one size",
    "50-80 kg",
    "80-120 kg",
    "Up to 80 kg (Bust: 105)",
    "Up to 110 kg (Bust: 120)",
    "Up to 110 kg",
  ];

  const lengthOptions = ["100", "105", "110", "150"];

  const navigate = useNavigate();

  const initialValues = {
    name: "",
    description: "",
    category: "",
    price: "",
    inStock: true,
    bestSeller: false,  // تم التأكيد عليها بقيمة ابتدائية false
    newArrival: false,  // تم الإضافة هنا بقيمة ابتدائية false
    availableWeights: [],
    availableLengths: [],
    colors: [{ color: "", image: null, inStock: true }],
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // 1. رفع الصور المحددة إلى Cloudinary بالتوازي لتوفير الوقت
      const uploadedColors = await Promise.all(
        values.colors.map(async (colorItem) => {
          if (colorItem.image && typeof colorItem.image !== "string") {
            const formData = new FormData();
            formData.append("file", colorItem.image);
            formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "YOUR_UPLOAD_PRESET");

            const cloudinaryResponse = await axios.post(
              `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME"}/image/upload`,
              formData
            );

            return {
              ...colorItem,
              image: cloudinaryResponse.data.secure_url,
            };
          }
          return colorItem;
        })
      );

      // 2. دمج مصفوفة الألوان الجديدة بعد تحويل صورها إلى روابط داخل الداتا النهائية
      const finalValues = {
        ...values,
        colors: uploadedColors,
      };

      // 3. إرسال الداتا للباك إند
      const response = await axios.post(`${baseUrl}/products`, finalValues);
      alert("Product added successfully!");
      resetForm();
      navigate("/");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Package className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Add New Product</h2>
          <p className="text-sm text-slate-500">
            Fill out the details below to add a product variant to your website.
          </p>
        </div>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={ProductValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, errors, touched, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" /> Model Name
                </label>
                <Field
                  name="name"
                  type="text"
                  placeholder="Model name"
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
                            checked={values.availableWeights.includes(weight)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                push(weight);
                              } else {
                                remove(values.availableWeights.indexOf(weight));
                              }
                            }}
                            className="w-4 h-4"
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
                            checked={values.availableLengths.includes(length)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                push(length);
                              } else {
                                remove(values.availableLengths.indexOf(length));
                              }
                            }}
                            className="w-4 h-4"
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

              {/* تجميع كل الـ Switches التفاعلية في حاوية فرعية رائعة داخل الجريد الأساسي */}
             {/* Switches Container */}
<div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 p-5 bg-slate-50/50 border border-slate-100 rounded-2xl mt-2">

  {/* Stock Status Toggle */}
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
      Availability Status
    </span>
    <label className="inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        name="inStock"
        checked={values.inStock}
        onChange={() => setFieldValue("inStock", !values.inStock)}
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      <span className="ms-3 text-sm font-semibold text-slate-700 flex items-center gap-1.5">
        {values.inStock ? (
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle className="w-4 h-4 shrink-0" /> In Stock
          </span>
        ) : (
          <span className="text-amber-600 font-semibold flex items-center gap-1">
            <XCircle className="w-4 h-4 shrink-0" /> Sold out
          </span>
        )}
      </span>
    </label>
  </div>

  {/* Best Seller Toggle */}
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
      Best Seller Badge
    </span>
    <label className="inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        name="bestSeller"
        checked={values.bestSeller}
        onChange={() => setFieldValue("bestSeller", !values.bestSeller)}
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      <span className="ms-3 text-sm font-semibold text-slate-700 flex items-center gap-1.5">
        {values.bestSeller ? (
          <span className="text-amber-500 font-semibold flex items-center gap-1">
            <Award className="w-4 h-4 shrink-0" /> Best Seller
          </span>
        ) : (
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Award className="w-4 h-4 shrink-0 opacity-50" /> Standard Item
          </span>
        )}
      </span>
    </label>
  </div>

  {/* New Arrival Toggle */}
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">
      New Arrival Badge
    </span>
    <label className="inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        name="newArrival"
        checked={values.newArrival}
        onChange={() => setFieldValue("newArrival", !values.newArrival)}
        className="sr-only peer"
      />
      <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
      <span className="ms-3 text-sm font-semibold text-slate-700 flex items-center gap-1.5">
        {values.newArrival ? (
          <span className="text-violet-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-4 h-4 shrink-0" /> New Arrival
          </span>
        ) : (
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-4 h-4 shrink-0 opacity-50" /> Standard Item
          </span>
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

            <hr className="my-6 border-slate-100" />

            {/* Dynamic Colors & Images Array */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-bold text-slate-800">
                    Color Variants
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add at least one color variant, upload an associated image file, and
                    its stock status.
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
                        className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-slate-50/60 rounded-xl border border-slate-100 relative group"
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
                              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
                            />
                          </div>
                          <ErrorMessage
                            name={`colors.${index}.color`}
                            component="span"
                            className="text-xs font-medium text-red-500"
                          />
                        </div>

                        {/* Variant Image File Upload */}
                        <div className="flex-2 w-full flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-sm text-slate-600 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-colors">
                                <Image className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="truncate max-w-45">
                                  {values.colors[index].image
                                    ? values.colors[index].image.name || "Image Selected"
                                    : "Upload Image File"}
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    setFieldValue(`colors.${index}.image`, file || null);
                                  }}
                                />
                              </label>
                            </div>

                            {/* مربع صغير لمعاينة الصورة Preview قبل الرفع */}
                            {values.colors[index].image && (
                              <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                <img
                                  src={
                                    typeof values.colors[index].image === "string"
                                      ? values.colors[index].image
                                      : URL.createObjectURL(values.colors[index].image)
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
                        <div className="flex items-center gap-2 min-w-30 self-center pt-2 md:pt-0">
                          <label className="inline-flex items-center cursor-pointer select-none">
                            <Field
                              type="checkbox"
                              name={`colors.${index}.inStock`}
                              className="sr-only peer"
                            />
                            <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
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
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors md:self-center self-end mt-2 md:mt-0"
                            title="Remove variant"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        push({ color: "", image: null, inStock: true })
                      }
                      className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-indigo-500 text-slate-600 hover:text-indigo-600 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all hover:bg-indigo-50/30"
                    >
                      <Plus className="w-4 h-4" /> Add Color Variant
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving
                    Product...
                  </>
                ) : (
                  "Publish Product"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddProductForm;