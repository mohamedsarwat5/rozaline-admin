import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
        image: Yup.string()
          .url("Must be a valid image URL")
          .required("Image URL is required"),
      })
    )
    .min(1, "At least one color variant is required"),
});

const UpdateProductForm = () => {
  const { id } = useParams(); // التقاط الـ ID المرسل عبر الرابط
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  // 1. جلب بيانات المنتج الحالية فور تحميل الصفحة
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/products/${id}`);
        // تعيين القيم القادمة من قاعدة البيانات لتصبح القيم الافتراضية للفورم
        setInitialValues({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "",
          price: data.price || "",
          inStock: data.inStock ?? true,
          colors: data.colors && data.colors.length > 0 ? data.colors : [{ color: "", image: "" }],
        });
      } catch (error) {
        console.error("Error fetching product details:", error);
        alert("Failed to load product details. Returning to dashboard.");
        navigate("/admin/products"); // التوجيه التلقائي في حال حدث خطأ
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProductDetails();
  }, [id, navigate]);

  // 2. معالجة إرسال البيانات المحدثة بالسيرفر
  const handleUpdateSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.put(`${baseUrl}/products/${id}`, values);
      alert("Product updated successfully!");
      navigate("/"); // العودة لجدول أو كروت المنتجات بعد النجاح
    } catch (error) {
      console.error("Error updating product:", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong while updating. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // شاشة انتظار حتى تنتهي عملية الـ GET الأولى للبيانات
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
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Update Product</h2>
            <p className="text-sm text-slate-400">Modify the fields below to patch your live product metadata.</p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)} // يعود خطوة للوراء في التصفح
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
        enableReinitialize={true} // سطر سحري: يخبر Formik بإعادة بناء الفورم فور وصول الـ initialValues من السيرفر
      >
        {({ values, isSubmitting, errors, touched }) => (
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
                  className={`px-4 py-2.5 rounded-xl border bg-slate-50/50 transition-all focus:outline-none focus:ring-2 focus:bg-white ${
                    errors.name && touched.name
                      ? "border-red-400 focus:ring-red-200"
                      : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                  }`}
                />
                <ErrorMessage name="name" component="span" className="text-xs font-medium text-red-500 mt-1" />
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
                  <option value="" disabled hidden>Select a category</option>
                  <option value="Sets">Sets</option>
                  <option value="Skirts">Skirts</option>
                  <option value="Blouses">Blouses</option>
                </Field>
                <ErrorMessage name="category" component="span" className="text-xs font-medium text-red-500 mt-1" />
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
                <ErrorMessage name="price" component="span" className="text-xs font-medium text-red-500 mt-1" />
              </div>

              {/* Stock Status Toggle */}
              <div className="flex flex-col gap-1.5 justify-center">
                <span className="text-sm font-semibold text-slate-700 mb-2 block">Availability Status</span>
                <label className="inline-flex items-center cursor-pointer select-none">
                  <Field type="checkbox" name="inStock" className="sr-only peer" />
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
              <ErrorMessage name="description" component="span" className="text-xs font-medium text-red-500 mt-1" />
            </div>

            <hr className="my-6 border-slate-50" />

            {/* Dynamic Colors & Images Array */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-md font-bold text-slate-800">Color Variants</h3>
                  <p className="text-xs text-slate-400">Manage your existing color blocks and picture endpoints.</p>
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
                          <ErrorMessage name={`colors.${index}.color`} component="span" className="text-xs font-medium text-red-500" />
                        </div>

                        {/* Variant Image URL String */}
                        <div className="flex-[2] w-full flex flex-col gap-1.5">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <Image className="w-4 h-4 text-slate-400" />
                            </span>
                            <Field
                              name={`colors.${index}.image`}
                              type="text"
                              placeholder="Image URL"
                              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
                            />
                          </div>
                          <ErrorMessage name={`colors.${index}.image`} component="span" className="text-xs font-medium text-red-500" />
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
                      onClick={() => push({ color: "", image: "" })}
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
                    <Loader2 className="w-5 h-5 animate-spin" /> Updating Product...
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