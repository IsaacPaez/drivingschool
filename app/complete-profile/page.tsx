"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthRedirector from "../components/AuthRedirector";
import { signIn } from "next-auth/react";

export default function CompleteProfilePage() {
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";
  const [form, setForm] = useState({
    email,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "hasLicense") {
      setForm({ ...form, hasLicense: value === "true" });
    } else if (name === "sex") {
      setForm({ ...form, sex: value });
    } else if (name === "birthDate") {
      // Solo acepta fechas válidas tipo YYYY-MM-DD
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
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error saving user profile");
        return;
      }
      // Redirige automáticamente a Auth0
      signIn("auth0", { callbackUrl: "/" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error:", errorMessage);
      setError("Error saving user profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 120 }}>
      <AuthRedirector />
      <div style={{ width: 800, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", borderRadius: 20, padding: 36, background: "#fff", marginTop: 60 }}>
        <h2 style={{ textAlign: "center", marginBottom: 28, fontWeight: 700, fontSize: 28, color: "#222" }}>Complete your profile</h2>
        <form onSubmit={handleSubmit}>
          <input name="email" value={form.email} readOnly style={{ width: "100%", marginBottom: 16, padding: 10, borderRadius: 8, background: "#f5f5f5", border: "1px solid #ccc", color: "#111", fontWeight: 600 }} />
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
            <input name="middleName" placeholder="Middle Name" value={form.middleName} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
            <input name="ssnLast4" placeholder="SSN Last 4" value={form.ssnLast4} onChange={handleChange} required style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <input name="streetAddress" placeholder="Street Address" value={form.streetAddress} onChange={handleChange} style={{ flex: 2, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
            <input name="apartmentNumber" placeholder="Apartment Number" value={form.apartmentNumber} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <input name="city" placeholder="City" value={form.city} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
            <input name="state" placeholder="State" value={form.state} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
            <input name="zipCode" placeholder="Zip Code" value={form.zipCode} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <input name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
            <select name="hasLicense" value={form.hasLicense ? "true" : "false"} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111", background: "#fff" }}>
              <option value="true">With License</option>
              <option value="false">Without License</option>
            </select>
            <input name="licenseNumber" placeholder="License Number" value={form.licenseNumber} onChange={handleChange} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111" }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <input name="birthDate" type="date" placeholder="Birth Date" value={form.birthDate} onChange={handleChange} required style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111", background: "#fff" }} />
            <select name="sex" value={form.sex} onChange={handleChange} required style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", color: "#111", background: "#fff" }}>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 14, borderRadius: 8, background: "#0070f3", color: "#fff", fontWeight: 600, fontSize: 16, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}