import React from "react";
import { useForm } from "react-hook-form";
import dateFormat from "dateformat";
import xlsx from "json-as-xlsx";

import {
  AutocompleteForm,
  AutocompleteList,
  CustomButton,
  DefaultButton,
} from "./components/ReviewComponents";

export interface ICompany {
  id: number;
  name: string;
  industryName: string;
  logoPath: string;
}

export interface IFormInputs {
  autocomplete: string;
}

export interface IReviews {
  sheet: "Reviews";
  columns: { label: string; value: string }[];
  content: {
    번호: number;
    직군: string;
    재직여부: string;
    근무지: string;
    날짜: string;
    별점: number;
    총평: string;
    장점: string;
    단점: string;
    "경영진에 바라는 점": string;
    추천여부: string;
  }[];
}

function Review() {
  const [autocomplete, setAutocomplete] = React.useState<ICompany[]>();
  const [company, setCompany] = React.useState<ICompany>();
  const autocompleteForm = useForm<IFormInputs>();
  const [reviews, setReviews] = React.useState<IReviews>();
  const [available, setAvailable] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  return (
    <>
      <h1>Review</h1>

      <article>
        잡플래닛 홈페이지 상에 등록된 Review를 수집합니다.
        <br />
        수집할 회사의 이름을 입력해주세요. <br />
      </article>

      <br />

      <AutocompleteForm
        autocompleteForm={autocompleteForm}
        setAutocomplete={setAutocomplete}
        setCompany={setCompany}
        setAvailable={setAvailable}
      />

      <br />
      {company && (
        <>
          <strong>{company.name} Review 수집</strong>
          <ol>
            <li>'수집 시작' : 2022~2020년까지의 Review를 최대 250개까지 자동으로 수집합니다.</li>
            <li>'갯수 설정' : 수집을 원하는 Review의 숫자를 선택해주세요.</li>
          </ol>
          <section>
            <div className="review-footer">
              {!available && (
                <>
                  <DefaultButton
                    companyId={company.id}
                    setReviews={setReviews}
                    setAvailable={setAvailable}
                    setLoading={setLoading}
                  />
                  <CustomButton
                    companyId={company.id}
                    setReviews={setReviews}
                    setAvailable={setAvailable}
                    setLoading={setLoading}
                  />
                </>
              )}

              {available && (
                <button
                  onClick={() => {
                    const today = dateFormat(new Date(), "yymmdd");
                    xlsx([reviews], {
                      fileName: `${company.name}_잡플래닛리뷰_${today}_v1.0`,
                      extraLength: 3,
                      writeOptions: {},
                    });
                  }}
                >
                  Download
                </button>
              )}
            </div>

            <br />
            {loading && <article>수집에는 1분 정도 소요됩니다. 잠시만 기다려주세요.</article>}
          </section>
        </>
      )}
      <section>
        {autocomplete && autocomplete.length > 0 && (
          <AutocompleteList
            autocomplete={autocomplete}
            setCompany={setCompany}
            setAutocomplete={setAutocomplete}
            autocompleteForm={autocompleteForm}
          />
        )}
      </section>
    </>
  );
}

export default Review;
