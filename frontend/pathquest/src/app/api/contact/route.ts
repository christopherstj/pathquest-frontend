import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting: simple in-memory store (resets on server restart)
// For production, consider using Redis or a database
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 requests per hour per IP

function getRateLimitInfo(ip: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS,
        });
        return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
    }

    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { allowed: false, remaining: 0 };
    }

    record.count++;
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactFormData {
    name: string;
    email: string;
    message: string;
    honeypot?: string; // Spam prevention
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "unknown";

        // Check rate limit
        const { allowed, remaining } = getRateLimitInfo(ip);
        if (!allowed) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Remaining": "0",
                        "Retry-After": "3600",
                    },
                }
            );
        }

        // Parse request body
        const body: ContactFormData = await request.json();
        const { name, email, message, honeypot } = body;

        // Honeypot check - if filled, it's likely a bot
        if (honeypot) {
            // Return success to not tip off the bot, but don't send email
            return NextResponse.json({ success: true });
        }

        // Validate required fields
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Name, email, and message are required." },
                { status: 400 }
            );
        }

        // Validate name length
        if (name.length < 2 || name.length > 100) {
            return NextResponse.json(
                { error: "Name must be between 2 and 100 characters." },
                { status: 400 }
            );
        }

        // Validate email format
        if (!EMAIL_REGEX.test(email)) {
            return NextResponse.json(
                { error: "Please enter a valid email address." },
                { status: 400 }
            );
        }

        // Validate message length
        if (message.length < 10 || message.length > 5000) {
            return NextResponse.json(
                { error: "Message must be between 10 and 5000 characters." },
                { status: 400 }
            );
        }

        // Check for required environment variables
        if (!process.env.RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not configured");
            return NextResponse.json(
                { error: "Email service is not configured." },
                { status: 500 }
            );
        }

        const contactEmail = process.env.CONTACT_EMAIL || "hello@pathquest.app";

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: "PathQuest Contact <contact@pathquest.app>",
            to: contactEmail,
            replyTo: email,
            subject: `[PathQuest Contact] Message from ${name}`,
            text: `
Name: ${name}
Email: ${email}

Message:
${message}

---
Sent via PathQuest contact form
IP: ${ip}
            `.trim(),
            html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: #fff; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
        .value { margin-top: 4px; }
        .message { background: #fff; padding: 15px; border-radius: 4px; border: 1px solid #eee; white-space: pre-wrap; }
        .footer { margin-top: 20px; font-size: 12px; color: #999; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Name</div>
                <div class="value">${escapeHtml(name)}</div>
            </div>
            <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
            </div>
            <div class="field">
                <div class="label">Message</div>
                <div class="message">${escapeHtml(message)}</div>
            </div>
            <div class="footer">
                Sent via PathQuest contact form • IP: ${escapeHtml(ip)}
            </div>
        </div>
    </div>
</body>
</html>
            `.trim(),
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json(
                { error: "Failed to send message. Please try again later." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, messageId: data?.id },
            {
                headers: {
                    "X-RateLimit-Remaining": remaining.toString(),
                },
            }
        );
    } catch (err) {
        console.error("Contact form error:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred. Please try again later." },
            { status: 500 }
        );
    }
}

// HTML escape helper to prevent XSS in email
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

