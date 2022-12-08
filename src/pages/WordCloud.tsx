import React from "react";
import {
  CreateWordCloudImageButton,
  ModifiedList,
  ResetButton,
  WordCloudForm,
  WordList,
} from "./components/WordCloudComponents";

export interface IWords {
  id: number;
  text: string;
  value: number;
  hidden: boolean;
  isChangedNow: boolean;
}

export interface IModified {
  message: string;
  asWasId: number;
  asIsId: number | null;
  category: "deleted" | "changed";
}

export interface IImageStatus {
  exists: boolean;
  src: string;
}

function WordCloud() {
  const [words, setWords] = React.useState<IWords[]>([]);
  const [initialWords, setInitialWords] = React.useState<IWords[]>([]);
  const [modified, setModified] = React.useState<IModified[]>([]);
  const [imageStatus, setImageStatus] = React.useState<IImageStatus>({ exists: false, src: "" });
  const [isWordcloudLoading, setIsWordcloudLoading] = React.useState<boolean>(false);
  return (
    <>
      <h1>Wordcloud 만들기</h1>

      <article>
        워드클라우드(Wordcloud)란 자료에 나타난 단어의 빈도를 시각화하여 보여주는 분석 방법입니다.
        <br />
        아래에 분석하고자 하는 텍스트를 입력해주세요. <br />
      </article>

      <br />

      <WordCloudForm
        setWords={setWords}
        setInitialWords={setInitialWords}
        setIsWordcloudLoading={setIsWordcloudLoading}
        setImageStatus={setImageStatus}
      />

      <br />

      {isWordcloudLoading && <article>Loading...</article>}

      <br />

      <section>
        {imageStatus.exists && (
          <img className="wordcloud_image" src={imageStatus.src} alt="wordcloud" />
        )}
      </section>

      <section>
        <div className="list">
          <h3>단어 분석</h3>
          <WordList words={words} setWords={setWords} setModified={setModified} />
        </div>

        <div className="list">
          <h3>변경내역</h3>
          <ModifiedList
            words={words}
            modified={modified}
            setWords={setWords}
            setModified={setModified}
          />
        </div>

        <div className="sidebar">
          <CreateWordCloudImageButton
            words={words.filter((word) => !word.hidden)}
            setImageStatus={setImageStatus}
            setIsWordcloudLoading={setIsWordcloudLoading}
          />
          <ResetButton initialWords={initialWords} setWords={setWords} setModified={setModified} />
        </div>
      </section>
    </>
  );
}
export default WordCloud;
