page.tx

"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const [tokens, setTokens] = useState<{ accessToken?: string, refreshToken?: string }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const challenge = new URLSearchParams(window.location.search).get('challenge');

                const response = await fetch(`/api/token?challenge=${challenge}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                // Check if user is authenticated
                if (response.status === 401 || response.status === 403) {
                    // Redirect to login with return URL
                    const currentUrl = window.location.pathname + window.location.search;
                    router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`);
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch tokens');
                }

                const data = await response.json();
                setTokens(data);
                setLoading(false);

                // Try to send to client app (optional, will fail silently if not running)
                try {
                    await fetch('http://localhost:8080/callback', {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });
                } catch (e) {
                    // Client app not running, that's okay
                    console.log('Client app not running on port 8080');
                }
            } catch (error) {
                console.error('Error:', error);
                setError('Failed to fetch tokens. Please try logging in again.');
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center" style={{
                background: " radial-gradient(circle, rgba(2,31,6,1) 65%, rgba(9,121,11,1) 88%, rgba(13,16,37,1) 100%)",
                color: '#fff',
            }}>
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold mb-4">Generating Tokens...</h1>
                    <p className="text-lg leading-6 animate-pulse">Please wait</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center" style={{
                background: " radial-gradient(circle, rgba(2,31,6,1) 65%, rgba(9,121,11,1) 88%, rgba(13,16,37,1) 100%)",
                color: '#fff',
            }}>
                <div className="text-center">
                    <h1 className="text-5xl font-extrabold mb-4 text-red-500">Error</h1>
                    <p className="text-lg">{error}</p>
                    <button
                        onClick={() => router.push('/api/auth/signin')}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-bold"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center p-8" style={{
            background: " radial-gradient(circle, rgba(2,31,6,1) 65%, rgba(9,121,11,1) 88%, rgba(13,16,37,1) 100%)",
            color: '#fff',
        }}>
            <div className="max-w-4xl w-full bg-gray-800 rounded-lg p-8 shadow-2xl">
                <h1 className="text-4xl font-extrabold mb-6 text-center">Your Access Tokens</h1>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold mb-2">Access Token:</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={tokens.accessToken || ''}
                                className="flex-1 bg-gray-700 text-white p-3 rounded font-mono text-sm break-all"
                            />
                            <button
                                onClick={() => copyToClipboard(tokens.accessToken || '')}
                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2">Refresh Token:</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={tokens.refreshToken || ''}
                                className="flex-1 bg-gray-700 text-white p-3 rounded font-mono text-sm break-all"
                            />
                            <button
                                onClick={() => copyToClipboard(tokens.refreshToken || '')}
                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold"
                            >
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-blue-900 rounded">
                        <h2 className="font-bold mb-2">Next Steps:</h2>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                            <li>Copy both tokens using the buttons above</li>
                            <li>Add them to your client's .env file</li>
                            <li>Run your ZTNA client application</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
