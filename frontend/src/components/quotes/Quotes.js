import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Added for navigation
import { getQuotes, addQuote, updateQuote, deleteQuote } from "../../api";
import "./Quotes.css";

function Quotes({ user, logout }) {
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [error, setError] = useState("");

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editText, setEditText] = useState("");
  const [editAuthor, setEditAuthor] = useState("");

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const data = await getQuotes(user.id);
    setQuotes(data);
  };

  const handleAdd = async () => {
    if (!newQuote.trim() || !newAuthor.trim()) {
      setError("Both Quote and Author are required");
      return;
    }
    setError("");
    await addQuote(user.id, { 
      text: newQuote.trim(), 
      author: newAuthor.trim() 
    });
    setNewQuote("");
    setNewAuthor("");
    loadQuotes();
  };

  const handleEdit = (quote) => {
    setSelectedQuote(quote);
    setEditText(quote.text);
    setEditAuthor(quote.author || "");
    setModalType("edit");
    setShowModal(true);
  };

  const confirmEdit = async () => {
    if (!editText.trim() || !editAuthor.trim()) {
      setError("Both fields are required");
      return;
    }
    setError("");
    await updateQuote(selectedQuote.id, { 
      text: editText.trim(), 
      author: editAuthor.trim() 
    });
    closeModal();
    loadQuotes();
  };

  const handleDelete = (quote) => {
    setSelectedQuote(quote);
    setModalType("delete");
    setShowModal(true);
  };

  const confirmDelete = async () => {
    await deleteQuote(selectedQuote.id);
    closeModal();
    loadQuotes();
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuote(null);
    setEditText("");
    setEditAuthor("");
    setError("");
  };

  return (
    <div className="quotes-page">
      <div className="top-bar">
        <h2>Welcome, {user.name}</h2>
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="add-quote">
        <input
          type="text"
          placeholder="Quote text..."
          value={newQuote}
          onChange={(e) => { setNewQuote(e.target.value); setError(""); }}
        />
        <input
          type="text"
          placeholder="Author..."
          value={newAuthor}
          onChange={(e) => { setNewAuthor(e.target.value); setError(""); }}
          style={{ marginLeft: "10px" }}
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      <table className="quotes-table">
        <thead>
          <tr>
            <th>Quote</th>
            <th>Author</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => (
            <tr key={q.id}>
              <td>{q.text}</td>
              <td>{q.author}</td>
              {/* Added the missing Created At column */}
              <td>{q.createdAt ? new Date(q.createdAt).toLocaleString() : "N/A"}</td>
              <td className="actions">
                <span onClick={() => handleEdit(q)}>Edit</span>
                <span className="delete" onClick={() => handleDelete(q)}>Delete</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            {modalType === "edit" && (
              <>
                <h3>Edit Quote</h3>
                <label>Quote:</label>
                <textarea
                  value={editText}
                  onChange={(e) => { setEditText(e.target.value); setError(""); }}
                  style={{ width: "100%", height: "60px", marginBottom: "10px" }}
                />
                <label>Author:</label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => { setEditAuthor(e.target.value); setError(""); }}
                  style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                />
                <div style={btnRow}>
                  <button onClick={confirmEdit}>Save</button>
                  <button onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}

            {modalType === "delete" && (
              <>
                <h3>Delete Quote</h3>
                <p>Are you sure you want to delete this quote?</p>
                <div style={btnRow}>
                  <button onClick={confirmDelete}>Yes</button>
                  <button onClick={closeModal}>No</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 };
const modalStyle = { background: "#fff", padding: "20px", width: "400px", borderRadius: "6px" };
const btnRow = { display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "15px" };

export default Quotes;