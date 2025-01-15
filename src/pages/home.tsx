import React from "react";
import Header from "../comp/header";

const Home: React.FC = () => {
    return (
        <div>
            <Header text='home'/>
            <div>
                <p>Home page content</p>
            </div>
        </div>
    )
};

export default Home;