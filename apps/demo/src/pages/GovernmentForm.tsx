import React, { useState } from "react";
import { AlertCircle, CheckCircle2, ShieldAlert, FileText, Send, RotateCcw } from "lucide-react";

export interface PensionFormData {
  fullName: string;
  aadhaarNumber: string;
  dob: string;
  gender: string;
  pensionCategory: string;
  ppoNumber: string;
  monthlyPension: string;
  mobileNumber: string;
  address: string;
  pincode: string;
  accountNumber: string;
  ifscCode: string;
  consentAgreed: boolean;
}

export const GovernmentForm: React.FC = () => {
  const [formData, setFormData] = useState<PensionFormData>({
    fullName: "",
    aadhaarNumber: "",
    dob: "",
    gender: "",
    pensionCategory: "",
    ppoNumber: "",
    monthlyPension: "",
    mobileNumber: "",
    address: "",
    pincode: "",
    accountNumber: "",
    ifscCode: "",
    consentAgreed: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required as per official records";
    if (!formData.aadhaarNumber.trim() || !/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = "Please enter a valid 12-digit Aadhaar / National ID number";
    }
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Please select gender";
    if (!formData.pensionCategory) newErrors.pensionCategory = "Select applicable pension category";
    if (!formData.ppoNumber.trim()) newErrors.ppoNumber = "PPO / Service reference number is mandatory";
    if (!formData.accountNumber.trim()) newErrors.accountNumber = "Bank account number is required";
    if (!formData.ifscCode.trim()) newErrors.ifscCode = "Valid IFSC Code is required";
    if (!formData.consentAgreed) newErrors.consentAgreed = "You must agree to the official declaration";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      aadhaarNumber: "",
      dob: "",
      gender: "",
      pensionCategory: "",
      ppoNumber: "",
      monthlyPension: "",
      mobileNumber: "",
      address: "",
      pincode: "",
      accountNumber: "",
      ifscCode: "",
      consentAgreed: false,
    });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto my-6 bg-white border border-slate-300 shadow-md rounded text-xs font-sans text-slate-800">
      {/* Official Government Header Banner */}
      <div className="bg-amber-900 text-white p-4 border-b-4 border-orange-500">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white text-amber-900 font-bold rounded-full flex items-center justify-center text-xs text-center border-2 border-orange-400">
            GOVT
          </div>
          <div>
            <h1 className="text-base font-bold uppercase tracking-wide">
              Ministry of Personnel, Public Grievances and Pensions
            </h1>
            <p className="text-[10px] text-amber-200">
              Department of Pension & Pensioners' Welfare — Unified Pension Portal (Form 14-B)
            </p>
          </div>
        </div>
      </div>

      {/* Dense Warning / Instructions Banner */}
      <div className="bg-amber-50 border-b border-amber-200 p-3 text-[11px] text-amber-950 flex gap-2 items-start">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Notice regarding Annual Life Certificate (Jeevan Pramaan) & Details Update:</span>
          <p className="mt-0.5">
            All pension beneficiaries must ensure accurate entry of their 12-digit Aadhaar, PPO number, and IFSC bank particulars. Discrepancies in nominee particulars or incomplete field submissions may lead to temporary holding of disbursement. Use synthetic test entries only.
          </p>
        </div>
      </div>

      {submitted && (
        <div className="m-4 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Application Successfully Submitted to Central Processing Queue</h4>
            <p className="text-xs mt-1">
              Acknowledgement Number: <strong>PEN-2026-982310</strong>. Form data has been stored and registered in the host database backend.
            </p>
            <div className="mt-2 text-[11px] bg-white p-2 rounded border border-emerald-200">
              <strong>Applicant:</strong> {formData.fullName} | <strong>Aadhaar:</strong> {formData.aadhaarNumber} | <strong>PPO:</strong> {formData.ppoNumber} | <strong>IFSC:</strong> {formData.ifscCode}
            </div>
          </div>
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="m-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded flex items-start gap-2 text-xs">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Form submission validation errors:</span>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              {Object.values(errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Complex multi-column Form */}
      <form onSubmit={handleSubmit} id="pension-application-form" className="p-6 space-y-6">
        {/* Section 1: Personal Details */}
        <fieldset className="border border-slate-300 p-4 rounded bg-slate-50/50">
          <legend className="px-2 font-bold text-slate-800 text-xs uppercase bg-white border border-slate-300 rounded">
            Section 1: Beneficiary Identity Particulars
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <label htmlFor="field-full-name" className="block font-semibold mb-1">
                Full Name of Beneficiary <span className="text-red-600">*</span>
              </label>
              <input
                id="field-full-name"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Savitri Devi"
                className={`w-full p-2 border rounded bg-white text-xs ${
                  errors.fullName ? "border-red-500 bg-red-50/30" : "border-slate-300"
                }`}
                required
              />
              {errors.fullName && <p className="text-red-600 text-[10px] mt-0.5">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="field-aadhaar" className="block font-semibold mb-1">
                Aadhaar Number (12 digits) <span className="text-red-600">*</span>
              </label>
              <input
                id="field-aadhaar"
                name="aadhaarNumber"
                type="text"
                maxLength={12}
                value={formData.aadhaarNumber}
                onChange={handleChange}
                placeholder="123456789012"
                className={`w-full p-2 border rounded bg-white text-xs ${
                  errors.aadhaarNumber ? "border-red-500 bg-red-50/30" : "border-slate-300"
                }`}
                required
              />
              <span className="text-[10px] text-slate-500">12 numeric digits without hyphens</span>
              {errors.aadhaarNumber && <p className="text-red-600 text-[10px] mt-0.5">{errors.aadhaarNumber}</p>}
            </div>

            <div>
              <label htmlFor="field-dob" className="block font-semibold mb-1">
                Date of Birth <span className="text-red-600">*</span>
              </label>
              <input
                id="field-dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                className={`w-full p-2 border rounded bg-white text-xs ${
                  errors.dob ? "border-red-500 bg-red-50/30" : "border-slate-300"
                }`}
                required
              />
              {errors.dob && <p className="text-red-600 text-[10px] mt-0.5">{errors.dob}</p>}
            </div>

            <div>
              <label htmlFor="field-gender" className="block font-semibold mb-1">
                Gender <span className="text-red-600">*</span>
              </label>
              <select
                id="field-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full p-2 border rounded bg-white text-xs ${
                  errors.gender ? "border-red-500 bg-red-50/30" : "border-slate-300"
                }`}
                required
              >
                <option value="">-- Select Gender --</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Transgender / Other</option>
              </select>
              {errors.gender && <p className="text-red-600 text-[10px] mt-0.5">{errors.gender}</p>}
            </div>

            <div>
              <label htmlFor="field-mobile" className="block font-semibold mb-1">
                Mobile Number (for SMS Alerts)
              </label>
              <input
                id="field-mobile"
                name="mobileNumber"
                type="tel"
                maxLength={10}
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
          </div>
        </fieldset>

        {/* Section 2: Pension Service Category */}
        <fieldset className="border border-slate-300 p-4 rounded bg-slate-50/50">
          <legend className="px-2 font-bold text-slate-800 text-xs uppercase bg-white border border-slate-300 rounded">
            Section 2: Pension Scheme & Service Reference
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <div>
              <label htmlFor="field-pension-category" className="block font-semibold mb-1">
                Pension Scheme Classification <span className="text-red-600">*</span>
              </label>
              <select
                id="field-pension-category"
                name="pensionCategory"
                value={formData.pensionCategory}
                onChange={handleChange}
                className={`w-full p-2 border rounded bg-white text-xs ${
                  errors.pensionCategory ? "border-red-500" : "border-slate-300"
                }`}
                required
              >
                <option value="">-- Select Scheme --</option>
                <option value="superannuation">Central Civil Superannuation Pension</option>
                <option value="family">Family Pension (Spouse/Dependent)</option>
                <option value="disability">Disability / Extraordinary Pension</option>
                <option value="defence">Defence Services Armed Forces Pension</option>
              </select>
              {errors.pensionCategory && <p className="text-red-600 text-[10px] mt-0.5">{errors.pensionCategory}</p>}
            </div>

            <div>
              <label htmlFor="field-ppo" className="block font-semibold mb-1">
                PPO / Reference Number <span className="text-red-600">*</span>
              </label>
              <input
                id="field-ppo"
                name="ppoNumber"
                type="text"
                value={formData.ppoNumber}
                onChange={handleChange}
                placeholder="PPO-2026-XXXX"
                className={`w-full p-2 border rounded bg-white text-xs ${
                  errors.ppoNumber ? "border-red-500" : "border-slate-300"
                }`}
                required
              />
              {errors.ppoNumber && <p className="text-red-600 text-[10px] mt-0.5">{errors.ppoNumber}</p>}
            </div>

            <div>
              <label htmlFor="field-monthly-pension" className="block font-semibold mb-1">
                Last Drawn Monthly Pension (₹)
              </label>
              <input
                id="field-monthly-pension"
                name="monthlyPension"
                type="number"
                value={formData.monthlyPension}
                onChange={handleChange}
                placeholder="e.g. 32500"
                className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
          </div>
        </fieldset>

        {/* Section 3: Bank Disbursement Particulars */}
        <fieldset className="border border-slate-300 p-4 rounded bg-slate-50/50">
          <legend className="px-2 font-bold text-slate-800 text-xs uppercase bg-white border border-slate-300 rounded">
            Section 3: Bank Disbursement Account Details
          </legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div>
              <label htmlFor="field-account-number" className="block font-semibold mb-1">
                Bank Savings Account Number <span className="text-red-600">*</span>
              </label>
              <input
                id="field-account-number"
                name="accountNumber"
                type="text"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter 11-16 digit account number"
                className={`w-full p-2 border rounded bg-white text-xs ${
                  errors.accountNumber ? "border-red-500" : "border-slate-300"
                }`}
                required
              />
              {errors.accountNumber && <p className="text-red-600 text-[10px] mt-0.5">{errors.accountNumber}</p>}
            </div>

            <div>
              <label htmlFor="field-ifsc" className="block font-semibold mb-1">
                Bank Branch IFSC Code <span className="text-red-600">*</span>
              </label>
              <input
                id="field-ifsc"
                name="ifscCode"
                type="text"
                maxLength={11}
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="SBIN0001234"
                className={`w-full p-2 border rounded bg-white text-xs uppercase ${
                  errors.ifscCode ? "border-red-500" : "border-slate-300"
                }`}
                required
              />
              {errors.ifscCode && <p className="text-red-600 text-[10px] mt-0.5">{errors.ifscCode}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="field-address" className="block font-semibold mb-1">
                Permanent Residential Address
              </label>
              <textarea
                id="field-address"
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="House No, Street, Village/Town, District"
                className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
              />
            </div>
          </div>
        </fieldset>

        {/* Section 4: Declaration & Consent */}
        <div className="p-3 bg-slate-100 border border-slate-300 rounded">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              id="field-consent"
              name="consentAgreed"
              type="checkbox"
              checked={formData.consentAgreed}
              onChange={handleChange}
              className="mt-0.5 rounded border-slate-400 text-blue-600"
              required
            />
            <span className="text-[11px] text-slate-700 leading-snug">
              I hereby solemnly affirm and declare that the particulars furnished above are true and complete to the best of my knowledge and belief. I agree to notify the disbursing authority immediately in case of re-employment, remarriage, or any alteration affecting eligibility.
            </span>
          </label>
          {errors.consentAgreed && <p className="text-red-600 text-[10px] mt-1 pl-5">{errors.consentAgreed}</p>}
        </div>

        {/* Form Controls */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Form
          </button>

          <button
            type="submit"
            id="submit-pension-form-btn"
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold shadow flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Pension Application
          </button>
        </div>
      </form>
    </div>
  );
};
