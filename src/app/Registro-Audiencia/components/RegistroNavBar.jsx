'use client'
import styles from '../RegistroAudiencia.module.css';

export default function RegistroNavBar({ navbarList, selectedTab, setSelectedTab }) {
    return (
      <div className={`${styles.navBarBlock}`}>
        {navbarList.map((el) => {
          return (
            <span
              onClick={() => setSelectedTab(el)}
              className={selectedTab === el ? `${styles.selectedTab} ${styles.tab}` : `${styles.tab}`}
              key={el}
            >
              <p>{el}</p>
            </span>
          );
        })}
      </div>
    );
  }
  