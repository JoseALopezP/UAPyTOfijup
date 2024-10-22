import styles from './NavBar.module.css';

export default function ViewNameText({ viewName }) {
  return (
    <p className={styles.viewNameBlock}>
      {viewName.split('-').join(' ')}
    </p>
  );
}