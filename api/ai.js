export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const { text, systemPrompt } = req.query;

        // Validate input
        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Parameter "text" diperlukan'
            });
        }

        // Build API URL
        const apiUrl = new URL('https://api.nekolabs.web.id/ai/gpt/4.1-mini');
        apiUrl.searchParams.append('text', text);
        
        if (systemPrompt) {
            apiUrl.searchParams.append('systemPrompt', systemPrompt);
        } else {
            // Default system prompt
            apiUrl.searchParams.append('systemPrompt', 'Nama kamu adalah Fukushima yang di ciptakan oleh AhmadXyz');
        }

        // Record start time
        const startTime = Date.now();

        // Make request to external API
        const response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });

        // Check if response is ok
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        // Parse response
        const data = await response.json();

        // Calculate response time
        const responseTime = Date.now() - startTime;

        // Return successful response
        return res.status(200).json({
            success: true,
            result: data.result || data.response || 'Tidak ada respons dari API',
            timestamp: new Date().toISOString(),
            responseTime: `${responseTime}ms`
        });

    } catch (error) {
        console.error('API Error:', error);
        
        return res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan saat menghubungi API',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
