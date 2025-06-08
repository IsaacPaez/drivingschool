"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterProfilePage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
    ssnLast4: "",
    hasLicense: false,
    licenseNumber: "",
    birthDate: "",
    sex: "M",
    streetAddress: "",
    apartmentNumber: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    howDidYouHear: "Online Ad",
    role: "user"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "hasLicense") {
      setForm({ ...form, hasLicense: value === "true" });
    } else if (name === "sex") {
      setForm({ ...form, sex: value });
    } else if (name === "birthDate") {
      // Only accept valid YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(value)) {
        setForm({ ...form, birthDate: value });
      } else {
        setForm({ ...form, birthDate: "" });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Password validation
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    try {
      const payload = { ...form };
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error saving user profile");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.replace("/");
      }, 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError("Error saving user profile: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Sign Up & Complete Your Profile</h2>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="middleName" placeholder="Middle Name" value={form.middleName} onChange={handleChange} className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="ssnLast4" placeholder="SSN Last 4" value={form.ssnLast4} onChange={handleChange} required className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="streetAddress" placeholder="Street Address" value={form.streetAddress} onChange={handleChange} className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="apartmentNumber" placeholder="Apartment Number" value={form.apartmentNumber} onChange={handleChange} className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="zipCode" placeholder="Zip Code" value={form.zipCode} onChange={handleChange} className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} className="rounded-lg border border-gray-300 px-4 py-2" />
            <select name="hasLicense" value={form.hasLicense ? "true" : "false"} onChange={handleChange} className="rounded-lg border border-gray-300 px-4 py-2">
              <option value="true">With License</option>
              <option value="false">Without License</option>
            </select>
            <input name="licenseNumber" placeholder="License Number" value={form.licenseNumber} onChange={handleChange} className="rounded-lg border border-gray-300 px-4 py-2" />
            <input name="birthDate" type="date" placeholder="Birth Date" value={form.birthDate} onChange={handleChange} required className="rounded-lg border border-gray-300 px-4 py-2" />
            <select name="sex" value={form.sex} onChange={handleChange} required className="rounded-lg border border-gray-300 px-4 py-2">
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 mt-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? "Registering..." : "Register"}
          </button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
        {success && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white p-8 rounded-xl shadow-xl text-center">
              <h3 className="text-2xl font-bold mb-4">Registration successful!</h3>
              <p className="mb-2">You will be redirected to the home page. Please log in to continue.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 