import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";

import Review from "./pages/Review";
import WordCloud from "./pages/WordCloud";

function App() {
  return (
    <>
      <div className="navigation">
        <Link to="/">Home</Link>
        <Link to="/review">Review</Link>
        <Link to="/wordcloud">Wordcloud</Link>
      </div>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/review" element={<Review />} />
          <Route path="/wordcloud" element={<WordCloud />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
