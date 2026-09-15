import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
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
  Tag,
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
  onSale: Yup.boolean(),
  SalePrice: Yup.number().when("onSale", {
    is: true,
    then: (schema) =>
      schema
        .positive("Sale price must be positive")
        .required("Sale price is required when product is on sale"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
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
    onSale: false,
    SalePrice: "",
    inStock: true,
    newArrival: false,
    bestSeller: false,
    availableWeights: [],
    availableLengths: [],
    colors: [{ color: "", image: null, inStock: true, isCompressing: false }],
  };

  const handleAddSubmit = async (values, { setSubmitting }) => {
    if (values.colors.some((c) => c.isCompressing)) {
      alert("⚠️ يرجى الانتظار حتى ينتهي ضغط الصور أولاً.");
      setSubmitting(false);
      return;
    }

    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

    if (!uploadPreset || !cloudName) {
      alert("⚠️ خطأ في الإعدادات: متغيرات بيئة Cloudinary غير معرّفة.");
      setSubmitting(false);
      return;
    }

    try {
      const uploadedColors = await Promise.all(
        values.colors.map(async (colorItem) => {
          if (colorItem.image instanceof File) {
            const formData = new FormData();
            formData.append("file", colorItem.image);
            formData.append("upload_preset", uploadPreset);

            const cloudinaryResponse = await axios.post(
              `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
              formData,
            );

            const { isCompressing, ...restColorItem } = colorItem;

            return {
              ...restColorItem,
              image: cloudinaryResponse.data.secure_url,
            };
          }
          return colorItem;
        }),
      );

      const finalValues = {
        ...values,
        SalePrice: values.onSale ? Number(values.SalePrice) : undefined,
        colors: uploadedColors,
      };

      await axios.post(`${baseUrl}/products`, finalValues);
      alert("🎉 Product added successfully!");
      navigate("/");
    } catch (error) {
      console.error("Submission error details:", error);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";

      alert(`🚨 حدث خطأ أثناء النشر:\n${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold cursor-pointer border text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all mb-4"
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
              Fill in the details below to publish a new garment to your live
              catalog.
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
                  <option value="Cardigan">Cardigan</option>
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
                          className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={values.availableWeights.includes(weight)}
                            onChange={(e) => {
                              if (e.target.checked) push(weight);
                              else
                                remove(values.availableWeights.indexOf(weight));
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
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
                          className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={values.availableLengths.includes(length)}
                            onChange={(e) => {
                              if (e.target.checked) push(length);
                              else
                                remove(values.availableLengths.indexOf(length));
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          {length}
                        </label>
                      ))}
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Original Price */}
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

              {/* Sale Price Input (Conditional Rendering) */}
              {values.onSale && (
                <div className="flex flex-col gap-1.5 transition-all duration-300">
                  <label className="text-sm font-semibold text-rose-600 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-rose-500" /> Sale Price (EGP)
                  </label>
                  <Field
                    name="SalePrice"
                    type="number"
                    placeholder="0.00"
                    className={`px-4 py-2.5 rounded-xl border bg-rose-50/30 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
                      errors.SalePrice && touched.SalePrice
                        ? "border-red-400 focus:ring-red-200"
                        : "border-rose-200 focus:ring-rose-100 focus:border-rose-500"
                    }`}
                  />
                  <ErrorMessage
                    name="SalePrice"
                    component="span"
                    className="text-xs font-medium text-red-500 mt-1"
                  />
                </div>
              )}

              {/* Badges Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:col-span-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-100/80">
                {/* Availability */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Availability
                  </span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <input
                      type="checkbox"
                      name="inStock"
                      checked={values.inStock}
                      onChange={(e) =>
                        setFieldValue("inStock", e.target.checked)
                      }
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

                {/* On Sale */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    On Sale Status
                  </span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <input
                      type="checkbox"
                      name="onSale"
                      checked={values.onSale}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setFieldValue("onSale", isChecked);
                        if (!isChecked) {
                          setFieldValue("SalePrice", "");
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-rose-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    <span className="ms-3 text-sm font-semibold text-slate-700">
                      {values.onSale ? (
                        <span className="text-rose-600 flex items-center gap-1">
                          <Tag className="w-4 h-4" /> On Sale
                        </span>
                      ) : (
                        <span className="text-slate-400">Regular</span>
                      )}
                    </span>
                  </label>
                </div>

                {/* New Arrival */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    New Arrival
                  </span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <input
                      type="checkbox"
                      name="newArrival"
                      checked={values.newArrival}
                      onChange={(e) =>
                        setFieldValue("newArrival", e.target.checked)
                      }
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

                {/* Best Seller */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Best Seller
                  </span>
                  <label className="inline-flex items-center cursor-pointer select-none mt-1">
                    <input
                      type="checkbox"
                      name="bestSeller"
                      checked={values.bestSeller}
                      onChange={(e) =>
                        setFieldValue("bestSeller", e.target.checked)
                      }
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

                        {/* Image Upload Block */}
                        <div className="flex-[2] w-full flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <label
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-sm text-slate-600 transition-colors ${
                                  values.colors[index].isCompressing
                                    ? "opacity-60 pointer-events-none bg-slate-50"
                                    : ""
                                }`}
                              >
                                {values.colors[index].isCompressing ? (
                                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin flex-shrink-0" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                )}
                                <span className="truncate max-w-[180px]">
                                  {values.colors[index].isCompressing
                                    ? "Compressing HD Image..."
                                    : values.colors[index].image
                                      ? values.colors[index].image.name
                                      : "Choose Image"}
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  disabled={
                                    values.colors[index].isCompressing ||
                                    isSubmitting
                                  }
                                  onChange={async (event) => {
                                    const file =
                                      event.currentTarget.files?.[0];
                                    if (file) {
                                      try {
                                        setFieldValue(
                                          `colors.${index}.isCompressing`,
                                          true,
                                        );
                                        const options = {
                                          maxSizeMB: 1.2,
                                          maxWidthOrHeight: 1600,
                                          useWebWorker: false,
                                          fileType: "image/jpeg",
                                        };

                                        const compressedBlob =
                                          await imageCompression(
                                            file,
                                            options,
                                          );
                                        const safeName = file.name
                                          ? file.name.replace(/\.[^/.]+$/, "") +
                                            ".jpg"
                                          : `mobile-img-${Date.now()}.jpg`;

                                        const compressedFile = new File(
                                          [compressedBlob],
                                          safeName,
                                          { type: "image/jpeg" },
                                        );

                                        setFieldValue(
                                          `colors.${index}.image`,
                                          compressedFile,
                                        );
                                        setFieldValue(
                                          `colors.${index}.isCompressing`,
                                          false,
                                        );
                                      } catch (compressError) {
                                        console.error(
                                          "Mobile compression failed, trying direct upload:",
                                          compressError,
                                        );
                                        setFieldValue(
                                          `colors.${index}.image`,
                                          file,
                                        );
                                        setFieldValue(
                                          `colors.${index}.isCompressing`,
                                          false,
                                        );
                                      }
                                    } else {
                                      setFieldValue(
                                        `colors.${index}.image`,
                                        null,
                                      );
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            {values.colors[index].image &&
                              !values.colors[index].isCompressing && (
                                <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                                  <img
                                    src={
                                      values.colors[index].image instanceof File
                                        ? URL.createObjectURL(
                                            values.colors[index].image,
                                          )
                                        : values.colors[index].image
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

                        {/* Remove button */}
                        {values.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        push({
                          color: "",
                          image: null,
                          inStock: true,
                          isCompressing: false,
                        })
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-600 bg-indigo-50/70 hover:bg-indigo-100/70 rounded-xl transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Variant
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Publishing Product...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Publish Product</span>
                  </>
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