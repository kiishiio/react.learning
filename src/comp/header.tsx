import React from "react";
import styles from './header.module.css';

interface HeaderProps {
    text: string;
}

const Header: React.FC<HeaderProps> = ({text}) => {
    const renderLetters = (text: string) => {
        return text.split('').map((char, index) => (
            <div key={index} className={styles.letter}>
                {char}
            </div>
        ));
    }

    return (
        <div className={styles.header}>
            {renderLetters(text)}
        </div>
    )
}

export default Header;