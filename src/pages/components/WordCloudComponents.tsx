import React from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchWordCloud, fetchWordCloudImage } from "../../api";
import { SubmitHandler, useForm } from "react-hook-form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faArrowTurnRight, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

import { IImageStatus, IModified, IWords } from "../WordCloud";

interface WordCloudFormProps {
  setWords: React.Dispatch<React.SetStateAction<IWords[]>>;
  setInitialWords: React.Dispatch<React.SetStateAction<IWords[]>>;
  setIsWordcloudLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setImageStatus: React.Dispatch<React.SetStateAction<IImageStatus>>;
}
/** text를 입력하면 api를 통해, text에 포함된 명사의 빈도수를 가져오는 Component */
export function WordCloudForm({
  setWords,
  setInitialWords,
  setIsWordcloudLoading,
  setImageStatus,
}: WordCloudFormProps) {
  const { register, handleSubmit, reset } = useForm<{ docs: string }>();
  const { mutate } = useMutation(fetchWordCloud);
  const onSubmit: SubmitHandler<{ docs: string }> = (data) => {
    setImageStatus({ exists: false, src: "" });
    setIsWordcloudLoading(true);
    mutate(data.docs, {
      onSuccess: (res) => {
        setWords(
          res.map((item: { id: number; text: string; value: number }) => ({
            ...item,
            hidden: false,
            isChangedNow: false,
          }))
        );
        setInitialWords(
          res.map((item: { id: number; text: string; value: number }) => ({
            ...item,
            hidden: false,
            isChangedNow: false,
          }))
        );
        setIsWordcloudLoading(false);
      },
    });
    reset();
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="wordcloud">텍스트 입력</label>
      <input type="text" id="wordcloud" {...register("docs")} />
      <button>분석 시작</button>
    </form>
  );
}

interface ResetButtonProps {
  initialWords: IWords[];
  setWords: React.Dispatch<React.SetStateAction<IWords[]>>;
  setModified: React.Dispatch<React.SetStateAction<IModified[]>>;
}
/** 수정사항을 최초 상태로 초기화 */
export function ResetButton({ setWords, initialWords, setModified }: ResetButtonProps) {
  return (
    <button
      className="sidebar_button"
      onClick={() => {
        setWords(initialWords);
        setModified([]);
      }}
    >
      변경내역 <br />
      전체취소
    </button>
  );
}

interface ModifiedListProps {
  words: IWords[];
  modified: IModified[];
  setWords: React.Dispatch<React.SetStateAction<IWords[]>>;
  setModified: React.Dispatch<React.SetStateAction<IModified[]>>;
}
/** 수정사항을 보여주는 Component, 개별적으로 reset할 수 있음 */
export function ModifiedList({ modified, setModified, words, setWords }: ModifiedListProps) {
  //변경사항(handleDelete, handleChange)을 취소하는 함수
  const handleCancel = (asWasId: number, asIsId: number | null, category: string) => {
    //일단 수정내역을 삭제하고 시작하자
    setModified((prev) => prev.filter((item) => item.asWasId !== asWasId));

    // 1. handleDelete 함수를 취소하는 경우
    if (category === "deleted") {
      setWords((prev) =>
        prev.map((word) => (word.id === asWasId ? { ...word, hidden: false } : word))
      );
    }

    // 2. handleChange 함수를 취소하는 경우
    if (category === "changed") {
      const asWasWord = words.find((word) => word.id === asWasId);
      const asIsWord = words.find((word) => word.id === asIsId);
      //Case 1. 완전히 새로운 text가 추가된 경우,
      if (asIsWord.value === asWasWord.value) {
        setWords((prev) => {
          // asIsWord는 삭제하고
          const newWords = prev.filter((word) => word.id !== asIsId);
          // asWasWord는 다시 보여준다
          return newWords.map((word) => (word.id === asWasId ? { ...word, hidden: false } : word));
        });
      }
      // Case 2. 기존에 있는 text로 변경된 경우,
      else {
        setWords((prev) => {
          // asIsWord의 value에서 asWasWord의 value를 빼고
          const newWords = prev.map((word) =>
            word.id === asIsId ? { ...word, value: word.value - asWasWord.value } : word
          );
          // asWasWord는 다시 보여준다
          return newWords.map((word) => (word.id === asWasId ? { ...word, hidden: false } : word));
        });
      }
    }
  };

  return (
    <ul className="word_list">
      {modified.map((item) => (
        <li key={item.asWasId}>
          {item.message}
          <FontAwesomeIcon
            className="span_button"
            icon={faRotateLeft}
            onClick={() => handleCancel(item.asWasId, item.asIsId, item.category)}
          />
        </li>
      ))}
    </ul>
  );
}

interface WordListProps {
  words: IWords[];
  setWords: React.Dispatch<React.SetStateAction<IWords[]>>;
  setModified: React.Dispatch<React.SetStateAction<IModified[]>>;
}
/** 단어들을 나열하고 수정이 가능한 Component
 * 수정은 단어를 삭제하거나, 다른 단어로 변경할 수 있음
 */
export function WordList({ words, setWords, setModified }: WordListProps) {
  //word list에서 필요없는 단어를 삭제하는 함수
  const handleDelete = (id: number) => {
    setWords((prev) => prev.map((word) => (word.id === id ? { ...word, hidden: true } : word)));
    setModified((prev) => {
      const target = words.find((word) => word.id === id);
      return [
        ...prev,
        {
          message: `"${target.text}(${target.value})" 삭제`,
          asWasId: id,
          asIsId: null,
          category: "deleted",
        },
      ];
    });
  };

  //word list에서 단어를 다른 단어로 변경하는 함수
  const handleChange = (event: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    // event.key가 "Enter"인 경우 함수가 실행됨
    if (event.key !== "Enter") {
      return;
    }
    //변환을 시켜버리자
    //일단 이 변환이 일어나고 있는 currentword에 대한 정보를 찾고, 애는 일단 가려주자
    const currentWord = words.find((word) => word.id === id);
    setWords((prev) =>
      prev.map((word) => (word.id === id ? { ...word, hidden: true, isChangedNow: false } : word))
    );

    //변환의 결과값이 될 targetWord를 case를 나눠서 변환해보자
    //Case 1. 기존에 있는 text를 추가할 경우, targetWord는 value를 더해줘
    if (words.find((word) => word.text === event.currentTarget.value)) {
      const targetWord = words.find((word) => word.text === event.currentTarget.value);
      targetWord.value = targetWord.value + currentWord.value;
      setWords((prev) => prev.map((word) => (word.id === targetWord.id ? targetWord : word)));
      setModified((prev) => [
        ...prev,
        {
          message: `"${currentWord.text}(${currentWord.value})" -> "${targetWord.text}" 변경`,
          asWasId: currentWord.id,
          asIsId: targetWord.id,
          category: "changed",
        },
      ]);
    }
    //Case2. 완전히 새로운 text를 추가할 경우, targetword를 새롭게 넣어줘
    else {
      const targetWord = {
        id: words.length,
        text: event.currentTarget.value,
        value: currentWord.value,
        hidden: false,
        isChangedNow: false,
      };
      setWords((prev) => [...prev, targetWord]);
      setModified((prev) => [
        ...prev,
        {
          message: `"${currentWord.text}(${currentWord.value})" -> "${targetWord.text}" 변경`,
          asWasId: currentWord.id,
          asIsId: targetWord.id,
          category: "changed",
        },
      ]);
    }
  };
  //handleChange 함수를 실행하기 위해 Input을 띄우는 함수
  const handdleChangeInput = (id: number) => {
    const state = words.find((word) => word.id === id).isChangedNow;
    setWords((prev) =>
      prev.map((word) => (word.id === id ? { ...word, isChangedNow: !state } : word))
    );
  };

  return (
    <ul className="word_list">
      {words
        .sort((a, b) => b.value - a.value)
        .filter((word) => !word.hidden)
        .map((item) => (
          <li key={item.id}>
            {item.text}, {item.value}회
            <FontAwesomeIcon
              className="span_button"
              onClick={() => handleDelete(item.id)}
              icon={faTrashCan}
            />
            <FontAwesomeIcon
              className="span_button"
              onClick={() => handdleChangeInput(item.id)}
              icon={faArrowTurnRight}
            />
            {item.isChangedNow && (
              <input
                type="text"
                placeholder="변경할 텍스트 입력 후 Enter"
                onKeyPress={(event) => handleChange(event, item.id)}
                onBlur={() => handdleChangeInput(item.id)}
                autoFocus
              />
            )}
          </li>
        ))}
    </ul>
  );
}

interface CreateWordCloudImageProps {
  words: IWords[];
  setImageStatus: React.Dispatch<React.SetStateAction<IImageStatus>>;
  setIsWordcloudLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
/** Wordcloud 이미지를 api를 통해 만들어주는 Component */
export function CreateWordCloudImageButton({
  words,
  setImageStatus,
  setIsWordcloudLoading,
}: CreateWordCloudImageProps) {
  const { mutate } = useMutation(fetchWordCloudImage);
  const handleClick = () => {
    //loading을 true로 바꿔준다
    setIsWordcloudLoading(true);
    //word.text를 word.value만큼 반복하고 " "로 구분하여 하나의 string으로 만들어준다.
    const text = words
      .map((word) => {
        const arr = new Array(word.value).fill(word.text);
        return arr.join(" ");
      })
      .join(" ");
    //해당 string으로 post 요청을 해준다
    mutate(text, {
      onSuccess: (res) => {
        const url = URL.createObjectURL(res);
        setImageStatus({ exists: true, src: url });
        setIsWordcloudLoading(false);
      },
    });
  };

  return (
    <>
      <button onClick={handleClick} className="sidebar_button">
        Wordcloud
        <br />
        만들기
      </button>
    </>
  );
}
