import React from "react";
import { Link } from "react-router-dom";
import { base_heroku_api_url } from "../api";

function Home() {
  // use UseEffect to start the heroku server
  React.useEffect(() => {
    fetch(base_heroku_api_url)
      .then((response) => response.json())
      .then((data) => console.log(data.message));
  }, []);

  return (
    <>
      <h1>Home</h1>
      <article className="home-article">오류 발생 시, 윤욱지 선임에게 알려주세요.</article>
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
