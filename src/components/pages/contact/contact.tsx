import React, { useState } from "react";
import styles from "./contact.module.css";
import { Link, useNavigate } from "react-router-dom";
import { sendContact } from "../../../api/contactus";
import { getToken } from "../../../utils/tokenUtils";
import { HomeIcon, CallIcon, MailIcon } from "../../../assets/Extra/svg";


function Contact() {

  const token = getToken()
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", subject: "", phone: "", message: "", appointment_date: "",});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { alert("Please Login First!");
      return;
    }
    try {
      if (form.name.trim().length < 3) { alert("Name is too Short!"); return; }

      if (!form.email.includes("@")) { alert("Invalid Email!"); return; }
      
      const cleanPhone = form.phone.replace(/\D/g, "");
      if (cleanPhone.length < 10) { alert("Invalid Phone Number!"); return; }

      if (form.message.trim().length < 10) { alert("Message too Short!"); return; }

      await sendContact(form);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setForm({ name: "", email: "", subject: "", phone: "", message: "", appointment_date: "", });
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  };

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 1);

  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 1);

  const formatDate = (date: any) => date.toISOString().split("T")[0];

  const contactInfo = [
    {
      icon: (<HomeIcon />), label: "Showroom Address", value: "42 Walnut Lane, Design District", note: "Chandigarh, Punjab 160001, India",
    },
    {
      icon: (<CallIcon />), label: "Phone Number", value: "+91 98765 43210 , +91 9876543211", note: "Mon–Sat, 10am – 7pm",
    },
    {
      icon: (<MailIcon />), label: "Email Us", value: "hello@furnitureco.in", note: "We Reply within 24 Hours",
    },
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <Link to="/" className={styles.logo}>
          Furniture<span>&nbsp;·&nbsp;</span>Co.
        </Link>
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/products" className={styles.navLink}>Products</Link>
          <Link to="/about" className={styles.navLink}>About</Link>
          <Link to="/contact" className={`${styles.navLink} ${styles.navLinkActive}`}>Contact</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroDecorLine} />
        <div className={styles.heroPill}>✦ We'd Love to Hear From You</div>
        <h1 className={styles.heroTitle}>Get in <em>Touch</em></h1>
        <p className={styles.heroSubtitle}>Whether it's a bespoke order, a question, or just saying hello — we're here.</p>
        <div className={styles.heroBreadcrumb}>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>Home</span>
          <span style={{ color: "#D6C4A8" }}>›</span>
          <span>Contact Us</span>
        </div>
      </section>

      <main className={styles.main}>
        <div className={styles.infoCol}>
          <p className={styles.sectionEyebrow}>Our Locations</p>
          <h2 className={styles.sectionTitle}>Let's <em>Connect</em></h2>
          <div className={styles.sectionLine} />
          <p className={styles.infoText}>
            Our team of design consultants is ready to help you find the perfect piece for your space.
            Visit our showroom, drop us a line, or send a message using the form — we'll get back to you promptly.
          </p>

          <div className={styles.contactCards}>
            {contactInfo.map((item, i) => (
              <div className={styles.contactCard} key={i}>
                <div className={styles.contactCardIcon}>{item.icon}</div>
                <div className={styles.contactCardBody}>
                  <p className={styles.contactCardLabel}>{item.label}</p>
                  <p className={styles.contactCardValue}>{item.value}</p>
                  <p className={styles.contactCardNote}>{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formCol}>
          <div className={styles.formCard}>
            <p className={styles.sectionEyebrow}>Send a Message</p>
            <h2 className={styles.sectionTitle}>How Can We <em>Help?</em></h2>
            <div className={styles.sectionLine} />

            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Full Name</label>
                  <input className={styles.formInput} type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="Your name" required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Address</label>
                  <input className={styles.formInput} type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="you@gmail.com" required />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <input className={styles.formInput} type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="+91 00000 00000" required/>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Subject</label>
                  <div className={styles.formSelectWrap}>
                    <select className={styles.formSelect} name="subject" value={form.subject} onChange={handleChange} required >
                      <option value="" disabled>Select a topic</option>
                      <option>Order</option>
                      <option>Showroom Visit</option>
                      <option>Product Enquiry</option>
                      <option>Other</option>
                    </select>
                    {form.subject === "Showroom Visit" && (
                      <input type="date" name="appointment_date" min={formatDate(minDate)} max={formatDate(maxDate)} value={form.appointment_date} onChange={handleChange} />
                    )}
                  </div>
                  
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Your Message</label>
                <textarea className={styles.formTextarea} name="message" value={form.message} onChange={handleChange}
                  placeholder="Tell us what's on your mind…" required />
              </div>

              <button type="submit" className={`${styles.submitBtn} ${submitted ? styles.submitBtnSuccess : ""}`} >
                {submitted ? ( <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    Message Sent!
                  </>
                ) : ( <> Send Message
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <div className={styles.bottomBand}>
        <div className={styles.bandItem}>
          <p className={styles.bandLabel}>Showroom Hours</p>
          <div className={styles.bandDivider} />
          <div className={styles.hoursTable}>
            {[
              { day: "Monday – Friday", time: "10:00 AM – 7:00 PM", open: true },
              { day: "Saturday", time: "10:00 AM – 6:00 PM", open: true },
              { day: "Sunday", time: "Closed", open: false },
            ].map((r, i) => (
              <div className={styles.hoursRow} key={i}>
                <span className={styles.hoursDay}>{r.day}</span>
                <span className={r.open ? styles.hoursOpen : styles.hoursClosed}>{r.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bandItem}>
          <p className={styles.bandLabel}>Design Consultation</p>
          <div className={styles.bandDivider} />
          <h3 className={styles.bandTitle}>Free In-Store Consultation</h3>
          <p className={styles.bandText}>
            Book a one-on-one session with our furniture experts. We'll help you plan, measure, and curate pieces that bring your vision to life.
          </p>
        </div>

        <div className={styles.bandItem}>
          <p className={styles.bandLabel}>Delivery & Care</p>
          <div className={styles.bandDivider} />
          <h3 className={styles.bandTitle}>Smart & Fast Delivery</h3>
          <p className={styles.bandText}>
            We ship across India with safe delivery service. All furniture is fully assembled and placed in your room of choice (If Possible). Contact us for bulk or custom orders.
          </p>
        </div>
      </div>

      <footer className={styles.footer}>
        <Link to="/" className={styles.footerLogo}>
          Furniture<span>·</span>Co.
        </Link>
        <p className={styles.footerCopy}>© 2026 Furniture·Co. All rights reserved.</p>
      </footer>
    </div>
  );
}


export default Contact;
