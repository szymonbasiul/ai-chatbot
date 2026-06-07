"use client";

import { useEffect, useState } from "react";
import { knowledgeBase } from "../data/knowledgeBase";

export default function Home() {
  const welcomeMessage = {
    sender: "bot",
    text: "Witaj! Jestem AI Agentem Administracji Publicznej. Możesz zapytać mnie o kontakt, godziny pracy, dokumenty, formularze albo poprosić o operatora.",
  };

  const [messages, setMessages] = useState([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    const savedMessages = localStorage.getItem("govChatHistory");

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "govChatHistory",
      JSON.stringify(messages)
    );
  }, [messages]);

  function searchKnowledgeBase(question) {
    let bestMatch = null;
    let bestScore = 0;

    knowledgeBase.forEach((item) => {
      let score = 0;

      item.keywords.forEach((keyword) => {
        if (question.includes(keyword.toLowerCase())) {
          score++;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    });

    return bestMatch;
  }

  function generateBotResponse(text) {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("pogoda") ||
      lowerText.includes("film") ||
      lowerText.includes("muzyka") ||
      lowerText.includes("sport")
    ) {
      return "To pytanie jest poza zakresem agenta administracji publicznej.";
    }

    const result = searchKnowledgeBase(lowerText);

    if (result) {
      return result.answer;
    }

    return "Nie mogę potwierdzić tej informacji. Mogę przekierować Cię do operatora.";
  }

  function sendMessage(customText = null) {
    const text = customText
      ? customText.trim()
      : input.trim();

    if (text === "") {
      addBotMessage("Wpisz pytanie przed wysłaniem.");
      return;
    }

    if (text.length < 3) {
      addBotMessage(
        "Pytanie jest za krótkie. Wpisz minimum 3 znaki."
      );
      return;
    }

    const response = generateBotResponse(text);

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
      {
        sender: "bot",
        text: response,
      },
    ]);

    setInput("");
    speakText(response);
  }

  function addBotMessage(text) {
    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text,
      },
    ]);
  }

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addBotMessage(
        "Twoja przeglądarka nie obsługuje rozpoznawania mowy."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "pl-PL";
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);

    recognition.start();

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };
  }

  function speakText(text) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = "pl-PL";

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
  }

  function clearChat() {
    localStorage.removeItem("govChatHistory");

    setMessages([
      {
        sender: "bot",
        text: "Historia rozmowy została wyczyszczona. Jak mogę pomóc?",
      },
    ]);
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    if (
      !form.name ||
      !form.email ||
      !form.message
    ) {
      alert("Wypełnij wszystkie pola.");
      return;
    }

    alert("Formularz został wysłany.");

    setForm({
      name: "",
      email: "",
      message: "",
    });
  }

  return (
    <main>
      <header className="header">
        <p className="badge">
          Zadanie 1
        </p>

        <h1>AI Agent Administracji Publicznej</h1>

        <p>
          Chatbot oparty o bazę wiedzy, obsługę
          głosową oraz historię rozmów.
        </p>
      </header>

      <section className="container">
        <section className="chatCard">
          <div className="chatTitle">
            <div>
              <h2>Czat z agentem</h2>
              <p>
                Zadaj pytanie dotyczące spraw
                urzędowych.
              </p>
            </div>

            <button
              className="secondaryButton"
              onClick={clearChat}
            >
              Wyczyść
            </button>
          </div>

          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.sender === "user"
                    ? "userMessage"
                    : "botMessage"
                }
              >
                <strong>
                  {message.sender === "user"
                    ? "Ty:"
                    : "Bot:"}
                </strong>{" "}
                {message.text}
              </div>
            ))}
          </div>

          <div className="inputArea">
            <input
              type="text"
              placeholder="Zadaj pytanie..."
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={() => sendMessage()}>
              Wyślij
            </button>
          </div>

          <div className="voiceArea">
            <button onClick={startVoiceInput}>
              {isListening
                ? "🎙 Słucham..."
                : "🎙 Mów"}
            </button>

            <button
              onClick={() =>
                speakText(
                  messages[messages.length - 1].text
                )
              }
            >
              🔊 Czytaj
            </button>

            <button onClick={stopSpeaking}>
              🛑 Stop
            </button>
          </div>
        </section>

        <aside className="sidePanel">
          <section className="card">
            <h2>FAQ</h2>

            <details>
              <summary>Jak działa chatbot?</summary>
              <p>
                Bot wyszukuje odpowiedzi w
                lokalnej bazie wiedzy.
              </p>
            </details>

            <details>
              <summary>Czy obsługuje głos?</summary>
              <p>
                Tak. Obsługuje mowę oraz
                odczytywanie odpowiedzi.
              </p>
            </details>
          </section>

          <section className="card">
            <h2>Kontakt</h2>

            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                placeholder="Imię i nazwisko"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />

              <input
                type="email"
                placeholder="Adres e-mail"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />

              <textarea
                rows="5"
                placeholder="Wiadomość"
                value={form.message}
                onChange={(e) =>
                  setForm({
                    ...form,
                    message: e.target.value,
                  })
                }
              />

              <button type="submit">
                Wyślij formularz
              </button>
            </form>
          </section>
        </aside>
      </section>
    </main>
  );
}