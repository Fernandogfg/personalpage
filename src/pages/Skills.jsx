import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SkillCard from '../components/SkillCard/SkillCard';
import { skills } from '../data/skills';
import styles from './Skills.module.css';

export default function Skills() {
  const { t } = useTranslation();

  const categories = [
    { key: 'frontend', label: t('skills.frontend'), data: skills.frontend },
    { key: 'backend', label: t('skills.backend'), data: skills.backend },
    { key: 'tools', label: t('skills.tools'), data: skills.tools },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="section">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('skills.title')}
          </motion.h2>
          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('skills.subtitle')}
          </motion.p>

          {categories.map((category) => (
            <div key={category.key} className={styles.category}>
              <motion.h3
                className={styles.categoryTitle}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {category.label}
              </motion.h3>
              <div className={styles.grid}>
                {category.data.map((skill, i) => (
                  <SkillCard
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    delay={i * 0.1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
