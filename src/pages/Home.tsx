import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <h1>Home</h1>
      <ul>
        <li>
          <Link to="/review">Review</Link> : 잡플래닛 Review를 수집합니다.
        </li>
        <li>
          <Link to="/wordcloud">Wordcloud</Link> : 텍스트를 Wordcloud로 시각화합니다.
        </li>
      </ul>
    </>
  );
}

export default Home;
