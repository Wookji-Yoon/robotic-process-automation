import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Review from "./pages/Review";
import WordCloud from "./pages/WordCloud";
import Comment from "./pages/Comment";

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
          <Route path="/comment" element={<Comment />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
