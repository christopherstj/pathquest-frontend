"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { Mail, Send, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

interface FormState {
    name: string;
    email: string;
    message: string;
    honeypot: string; // Hidden field for spam prevention
}

interface FormErrors {
    name?: string;
    email?: string;
    message?: string;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
    const [formData, setFormData] = useState<FormState>({
        name: "",
        email: "",
        message: "",
        honeypot: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
    const [submitError, setSubmitError] = useState<string>("");

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        } else if (formData.name.length > 100) {
            newErrors.name = "Name must be less than 100 characters";
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = "Message is required";
        } else if (formData.message.length < 10) {
            newErrors.message = "Message must be at least 10 characters";
        } else if (formData.message.length > 5000) {
            newErrors.message = "Message must be less than 5000 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitStatus("submitting");
        setSubmitError("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to send message");
            }

            setSubmitStatus("success");
            setFormData({ name: "", email: "", message: "", honeypot: "" });
        } catch (err) {
            setSubmitStatus("error");
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred"
            );
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header with back to app link */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Logo size={32} className="text-primary" />
                        <span className="font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                            PathQuest
                        </span>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to App
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <Mail className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            Get in Touch
                        </span>
                    </div>
                    <h1
                        className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Contact Us
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Have a question, suggestion, or just want to say hi? We'd
                        love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Form */}
            <section className="py-12 px-6">
                <div className="max-w-xl mx-auto">
                    {submitStatus === "success" ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h2
                                className="text-2xl font-bold text-foreground mb-4"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Message Sent!
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Thanks for reaching out. We'll get back to you as
                                soon as possible.
                            </p>
                            <button
                                onClick={() => setSubmitStatus("idle")}
                                className="text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Honeypot field - hidden from users, bots will fill it */}
                            <input
                                type="text"
                                name="honeypot"
                                value={formData.honeypot}
                                onChange={handleChange}
                                className="absolute -left-[9999px]"
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                            />

                            {/* Name Field */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg bg-card border ${
                                        errors.name
                                            ? "border-red-500"
                                            : "border-border"
                                    } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors`}
                                    placeholder="Your name"
                                    disabled={submitStatus === "submitting"}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg bg-card border ${
                                        errors.email
                                            ? "border-red-500"
                                            : "border-border"
                                    } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors`}
                                    placeholder="your@email.com"
                                    disabled={submitStatus === "submitting"}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Message Field */}
                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={6}
                                    className={`w-full px-4 py-3 rounded-lg bg-card border ${
                                        errors.message
                                            ? "border-red-500"
                                            : "border-border"
                                    } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none`}
                                    placeholder="How can we help you?"
                                    disabled={submitStatus === "submitting"}
                                />
                                {errors.message && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.message}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-muted-foreground text-right">
                                    {formData.message.length}/5000
                                </p>
                            </div>

                            {/* Error Message */}
                            {submitStatus === "error" && (
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-500">
                                        {submitError}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitStatus === "submitting"}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitStatus === "submitting" ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </section>

            {/* FAQ CTA */}
            <section className="py-12 px-6 bg-muted/20 border-t border-border/50">
                <div className="max-w-2xl mx-auto text-center">
                    <h2
                        className="text-xl font-bold text-foreground mb-3"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        Looking for Quick Answers?
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        Check out our FAQ for answers to common questions.
                    </p>
                    <Link
                        href="/faq"
                        className="text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        View FAQ →
                    </Link>
                </div>
            </section>

            {/* Footer Navigation */}
            <footer className="py-8 px-6 border-t border-border/50">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <nav className="flex items-center gap-6 text-sm">
                        <Link
                            href="/about"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            href="/faq"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            FAQ
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/contact"
                            className="text-foreground font-medium"
                        >
                            Contact
                        </Link>
                    </nav>
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} PathQuest
                    </p>
                </div>
            </footer>
        </div>
    );
}

