"use client";

import { useState } from "react";
import { knowledgeBase } from "../data/knowledgeBase";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Witaj! Jestem AI Agentem Administracji Publicznej. Możesz zapytać mnie o kontakt, godziny pracy, dokumenty, formularze albo poprosić o operatora.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  function sendMessage(customText = null) {
    const text = customText ? customText.trim() : input.trim();

    if (text === "") {
      addBotMessage("Wpisz pytanie przed wysłaniem.");
      return;
    }

    if (text.length < 3) {
      addBotMessage("Pytanie jest za krótkie. Wpisz minimum 3 znaki.");
      return;
    }

    if (/^[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9]+$/.test(text)) {
      addBotMessage("Nie rozumiem pytania. Spróbuj napisać je pełnym zdaniem.");
      return;
    }

    const response = generateBotResponse(text);

    setMessages((prev) => [
      ...prev,
      { sender: "user", text },
      { sender: "bot", text: response },
    ]);

    setInput("");
    speakText(response);
  }

  function addBotMessage(text) {
    setMessages((prev) => [...prev, { sender: "bot", text }]);
    speakText(text);
  }

  function generateBotResponse(text) {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("pogoda") ||
      lowerText.includes("film") ||
      lowerText.includes("sport") ||
      lowerText.includes("muzyka")
    ) {
      return "To pytanie jest poza zakresem agenta administracji publicznej. Mogę pomóc w sprawach kontaktu, godzin pracy, dokumentów, formularzy lub przekierować do operatora.";
    }

    const result = searchKnowledgeBase(lowerText);

    if (result) {
      return result.answer;
    }

    return "Nie mogę potwierdzić tej informacji na podstawie dostępnych danych. Mogę przekierować Cię do operatora — wpisz „operator”.";
  }

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

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addBotMessage(
        "Twoja przeglądarka nie obsługuje rozpoznawania mowy. Użyj Chrome lub Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "pl-PL";
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onerror = function () {
      addBotMessage("Nie udało się rozpoznać mowy. Spróbuj ponownie.");
      setIsListening(false);
    };

    recognition.onend = function () {
      setIsListening(false);
    };
  }

  function speakText(text) {
    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pl-PL";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  function clearChat() {
    setMessages([
      {
        sender: "bot",
        text: "Historia rozmowy została wyczyszczona. Jak mogę pomóc?",
      },
    ]);
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      alert("Wypełnij wszystkie pola formularza.");
      return;
    }

    alert("Formularz został wysłany symulacyjnie.");

    setForm({
      name: "",
      email: "",
      message: "",
    });
  }

  return (
    <main>
      <header className="header">
        <p className="badge">Zadanie 1</p>
        <h1>AI Agent Administracji Publicznej</h1>
        <p>
          Responsywna aplikacja webowa z chatbotem, bazą wiedzy, FAQ,
          formularzem kontaktowym i obsługą głosową.
        </p>
      </header>

      <section className="container">
        <section className="chatCard">
          <div className="chatTitle">
            <div>
              <h2>Czat z agentem</h2>
              <p>Zapytaj o sprawy urzędowe lub poproś o operatora.</p>
            </div>

            <button className="secondaryButton" onClick={clearChat}>
              Wyczyść
            </button>
          </div>

          <div className="messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.sender === "user" ? "userMessage" : "botMessage"
                }
              >
                <strong>{message.sender === "user" ? "Ty:" : "Bot:"}</strong>{" "}
                {message.text}
              </div>
            ))}
          </div>

          <div className="inputArea">
            <input
              type="text"
              placeholder="Zadaj pytanie..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
            />

            <button onClick={() => sendMessage()}>Wyślij</button>
          </div>

          <div className="voiceArea">
            <button onClick={startVoiceInput}>
              {isListening ? "🎙 Słucham..." : "🎙 Mów"}
            </button>

            <button onClick={() => speakText(messages[messages.length - 1].text)}>
              🔊 Czytaj ostatnią
            </button>

            <button onClick={stopSpeaking}>🛑 Stop</button>
          </div>
        </section>

        <aside className="sidePanel">
          <section className="card">
            <h2>FAQ</h2>

            <details>
              <summary>Jak działa chatbot?</summary>
              <p>
                Bot analizuje pytanie i wyszukuje odpowiedź w przygotowanej
                bazie wiedzy.
              </p>
            </details>

            <details>
              <summary>Co zrobić, gdy bot nie zna odpowiedzi?</summary>
              <p>
                Bot informuje, że nie może potwierdzić informacji i proponuje
                kontakt z operatorem.
              </p>
            </details>

            <details>
              <summary>Czy strona obsługuje głos?</summary>
              <p>
                Tak. Użytkownik może dyktować pytania, a bot może odczytywać
                odpowiedzi głosowo.
              </p>
            </details>

            <details>
              <summary>Jakie pytania można zadawać?</summary>
              <p>
                Możesz pytać o kontakt, godziny pracy, dokumenty, formularze i
                operatora.
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
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />

              <input
                type="email"
                placeholder="Adres e-mail"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                required
              />

              <textarea
                placeholder="Wiadomość"
                rows="5"
                value={form.message}
                onChange={(event) =>
                  setForm({ ...form, message: event.target.value })
                }
                required
              />

              <button type="submit">Wyślij formularz</button>
            </form>
          </section>
        </aside>
      </section>
    </main>
  );
}