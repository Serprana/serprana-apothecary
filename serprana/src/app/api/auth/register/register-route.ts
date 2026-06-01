import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, password, firstName, lastName } = await req.json()

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
    },
  })

  // Send welcome email
  try {
    await resend.emails.send({
      from: 'Serprana Apothecary <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Serprana Apothecary 🌿',
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; color: #1a1a18;">
          <h1 style="font-size: 28px; font-weight: 300; color: #5A7A5A; margin-bottom: 4px;">Serprana Apothecary</h1>
          <p style="font-size: 11px; letter-spacing: 3px; color: #B85C38; text-transform: uppercase; margin-top: 0;">Playa Venao, Panama</p>
          
          <hr style="border: none; border-top: 1px solid #e8e0d0; margin: 24px 0;" />
          
          <p style="font-size: 16px; color: #5A7A5A;">Dear ${firstName},</p>
          
          <p style="font-size: 15px; line-height: 1.7; color: #3a3a38;">
            Welcome to Serprana Apothecary. Your account has been created and you can now save custom tea blends, view your order history, and return to in-progress blends whenever you visit.
          </p>
          
          <p style="font-size: 15px; line-height: 1.7; color: #3a3a38; font-style: italic;">
            "Plants hold memory, wisdom, and medicine. Let us help you find yours."
          </p>
          
          <hr style="border: none; border-top: 1px solid #e8e0d0; margin: 24px 0;" />
          
          <p style="font-size: 12px; color: #8a8a78;">
            Serprana Apothecary · Inside Casa Venao Café · Playa Venao, Panama<br/>
            serpranahealing@gmail.com · serprana.com
          </p>
        </div>
      `,
    })
  } catch (emailError) {
    // Don't fail registration if email fails
    console.error('Welcome email failed:', emailError)
  }

  return NextResponse.json({ success: true, userId: user.id })
}
