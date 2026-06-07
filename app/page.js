"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Witaj! Jestem AI Agentem Administracji Publicznej. Zadaj pytanie dotyczące kontaktu, godzin pracy, dokumentów albo operatora.",
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

    if (lowerText.includes("kontakt")) {
      return "Dane kontaktowe znajdziesz w sekcji Kontakt. Możesz też wypełnić formularz na dole strony.";
    }

    if (lowerText.includes("godziny")) {
      return "Urząd pracuje od poniedziałku do piątku. Dokładne godziny należy potwierdzić na oficjalnej stronie urzędu.";
    }

    if (lowerText.includes("dokument") || lowerText.includes("wniosek")) {
      return "W sprawie dokumentów przygotuj dowód osobisty oraz wymagany formularz. Szczegóły znajdują się w oficjalnym źródle urzędu.";
    }

    if (
      lowerText.includes("operator") ||
      lowerText.includes("człowiek") ||
      lowerText.includes("pomoc")
    ) {
      return "Przekierowuję do operatora. W rzeczywistym systemie rozmowa zostałaby przekazana pracownikowi urzędu.";
    }

    if (lowerText.includes("pogoda") || lowerText.includes("film")) {
      return "To pytanie jest poza zakresem agenta administracji publicznej. Mogę pomóc w sprawach kontaktu, godzin pracy, dokumentów i formularzy.";
    }

    return "Nie mogę potwierdzić tej informacji na podstawie dostępnych źródeł. Mogę przekierować Cię do operatora — wpisz operator.";
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

  function handleFormSubmit(event) {
    event.preventDefault();

    if (!form.name || !form.email || !form.message) {
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
        <p className="badge">Scenariusz 2 — Responsywna strona WWW</p>
        <h1>AI Agent Administracji Publicznej</h1>
        <p>
          Responsywna aplikacja webowa z chatbotem, FAQ, formularzem
          kontaktowym i obsługą głosową.
        </p>
      </header>

      <section className="container">
        <section className="chatCard">
          <h2>Czat z agentem</h2>

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
              🔊 Czytaj ostatnią odpowiedź
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
                Bot analizuje wpisany tekst i odpowiada na podstawie prostych
                reguł oraz przygotowanej bazy wiedzy.
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