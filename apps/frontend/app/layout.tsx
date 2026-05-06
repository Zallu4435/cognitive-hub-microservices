import './globals.css'
import { cookies } from 'next/headers'
import Navbar from '../components/layout/Navbar'
import { Outfit, JetBrains_Mono } from 'next/font/google'

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
    display: 'swap',
})

export const metadata = {
    title: 'Knowledge Hub OS',
    description: 'AI-Powered Career & Productivity Engine',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('kh_os_token')?.value;

    return (
        <html lang="en" suppressHydrationWarning className={`${outfit.variable} ${jetbrainsMono.variable}`}>
            <body className="min-h-screen bg-background text-textMain font-sans antialiased flex flex-col" suppressHydrationWarning>
                <Navbar isLoggedIn={!!token} />

                {/* Page Content */}
                <main className="flex-1 w-full max-w-7xl mx-auto p-6 pt-24 flex flex-col">
                    {children}
                </main>
            </body>
        </html>
    )
}
