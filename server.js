import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        status: "online",
        message: "My AI backend is running"
    });
});

app.post("/chat", async (req, res) => {

    try {

        const userMessage = req.body.message;

        if (!userMessage || !userMessage.trim()) {
            return res.status(400).json({
                error: "Message is required"
            });
        }

        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    model: "openai/gpt-oss-120b:fastest",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are My AI, a helpful, intelligent and friendly AI assistant. Answer clearly and accurately."
                        },
                        {
                            role: "user",
                            content: userMessage
                        }
                    ],

                    stream: false
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Hugging Face error:", data);

            return res.status(response.status).json({
                error: "AI provider error",
                details: data
            });
        }

        const reply =
            data.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "AI returned no response"
            });
        }

        res.json({
            reply: reply
        });

    } catch (error) {

        console.error("Server error:", error);

        res.status(500).json({
            error: "Failed to connect to AI"
        });
    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`My AI server running on port ${PORT}`);
});
