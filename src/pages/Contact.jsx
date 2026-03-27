import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SocialLinks from '../components/SocialLinks/SocialLinks';
import styles from './Contact.module.css';

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder - would integrate with email service
    const mailto = `mailto:fernandofgfg10@gmail.com?subject=Contato Portfolio - ${form.name}&body=${form.message}%0A%0AFrom: ${form.email}`;
    window.location.href = mailto;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="section">
        <div className="container">
          <motion.h2 className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('contact.title')}
          </motion.h2>
          <motion.p className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {t('contact.subtitle')}
          </motion.p>

          <div className={styles.grid}>
            <motion.form
              className={styles.form}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.field}>
                <label className={styles.label}>{t('contact.name_label')}</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={t('contact.name_placeholder')}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t('contact.email_label')}</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={t('contact.email_placeholder')}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>{t('contact.message_label')}</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder={t('contact.message_placeholder')}
                  className={styles.textarea}
                  rows={5}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {t('contact.send')}
              </button>
            </motion.form>

            <motion.div
              className={styles.info}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className={styles.infoTitle}>Fernando Gabriel</h3>
              <p className={styles.infoText}>Campo Grande, MS - Brasil</p>
              <p className={styles.infoText}>fernandofgfg10@gmail.com</p>
              <p className={styles.infoText}>+55 67 99177-7181</p>
              <div className={styles.socialSection}>
                <SocialLinks />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
