import { useEffect, useState } from "react";
import { fetchMe, getStoredUser, logout, updateProfile } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import profileImage from "../../assets/images/profile.jpg";
import "./Profile.css";

export default function Profile() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", text: "" });
  const [gender, setGender] = useState(localStorage.getItem("profile_gender") || "female");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState(localStorage.getItem("profile_address") || "");
  const [location, setLocation] = useState(localStorage.getItem("profile_location") || "");

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await fetchMe();
        const fullName = user.username?.trim() || "";
        const [first = "", ...rest] = fullName.split(" ");
        const last = rest.join(" ");

        setFirstName(first);
        setLastName(last);
        setEmail(user.email || "");
        setPhoneNumber(user.phone_number || "");
      } catch {
        const user = getStoredUser();
        if (user) {
          const fullName = user.username?.trim() || "";
          const [first = "", ...rest] = fullName.split(" ");
          setFirstName(first);
          setLastName(rest.join(" "));
          setEmail(user.email || "");
          setPhoneNumber(user.phone_number || "");
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []); // Run only once on mount

  function handleGenderToggle(value) {
    setGender(value);
    localStorage.setItem("profile_gender", value);
  }

  function handleDiscard() {
    if (storedUser) {
      const fullName = storedUser.username?.trim() || "";
      const [first = "", ...rest] = fullName.split(" ");
      setFirstName(first);
      setLastName(rest.join(" "));
      setEmail(storedUser.email || "");
      setPhoneNumber(storedUser.phone_number || "");
    }
    setAddress(localStorage.getItem("profile_address") || "");
    setLocation(localStorage.getItem("profile_location") || "");
    setGender(localStorage.getItem("profile_gender") || "female");
    setFeedback({ type: "", text: "" });
  }

  async function handleSave(event) {
    event.preventDefault();
    setFeedback({ type: "", text: "" });

    if (!firstName.trim() || !lastName.trim()) {
      setFeedback({ type: "error", text: "Please enter both your first name and last name." });
      return;
    }

    if (!phoneNumber.trim()) {
      setFeedback({ type: "error", text: "Please enter your phone number." });
      return;
    }

    setSaving(true);

    try {
      const username = `${firstName.trim()} ${lastName.trim()}`;
      await updateProfile({ username, phone_number: phoneNumber.trim() });

      localStorage.setItem("profile_address", address);
      localStorage.setItem("profile_location", location);
      localStorage.setItem("profile_gender", gender);

      setFeedback({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => setFeedback({ type: "", text: "" }), 3000);
    } catch (error) {
      setFeedback({ type: "error", text: error.message || "Unable to save profile." });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (loading) {
    return <div className="profile-loading">Loading profile…</div>;
  }

  return (
    <main className="profile-page">
      {feedback.text && (
        <div className={`profile-notice ${feedback.type}`}>{feedback.text}</div>
      )}

      <div className="profile-shell">
        <aside className="profile-sidebar">
          <div className="brand-panel">
            <div className="brand-icon">⌛</div>
            <div className="brand-name">Timeless</div>
          </div>

          <div className="profile-card">
            <img src={profileImage} alt="Profile" className="profile-avatar" />
            <div className="profile-username">{`${firstName || "User"} ${lastName || ""}`.trim()}</div>
          </div>

          <nav className="sidebar-nav">
            <button type="button" className="nav-link active">Personal Information</button>
            <button type="button" className="nav-link disabled">Login & Password</button>
            <button type="button" className="nav-link logout" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        </aside>

        <section className="profile-content">
          <div className="content-header">
            <h1>Personal Information</h1>
            <div className="gender-switcher">
              <button
                type="button"
                className={`gender-button ${gender === "male" ? "selected" : ""}`}
                onClick={() => handleGenderToggle("male")}
              >
                Male
              </button>
              <button
                type="button"
                className={`gender-button ${gender === "female" ? "selected" : ""}`}
                onClick={() => handleGenderToggle("female")}
              >
                Female
              </button>
            </div>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-row">
              <div className="input-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group full-width">
                <label>Email</label>
                <input type="email" value={email} disabled />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone Number"
                />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="button-secondary" onClick={handleDiscard}>
                Discard Change
              </button>
              <button type="submit" className="button-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Change"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
