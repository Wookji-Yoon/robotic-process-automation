import React from "react";
import { useQuery } from "@tanstack/react-query";

import { ICompany, IFormInputs, IReviews } from "../Review";
import {
  fetchJobplanetAutoComplete,
  fetchJobPlanetReviewCustom,
  fetchJobplanetReviewDefault,
} from "../../api";
import { UseFormReturn } from "react-hook-form";

interface ButtonProps {
  companyId: number;
  setReviews: React.Dispatch<React.SetStateAction<IReviews>>;
  setAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
/** 2020~2022년까지의 리뷰를 최대 250개까지 수집하는 버튼 */
export function DefaultButton({ companyId, setReviews, setAvailable, setLoading }: ButtonProps) {
  const [isFetchStart, setIsFetchStart] = React.useState(false);
  useQuery(["reviewsDefault", companyId], () => fetchJobplanetReviewDefault(companyId), {
    enabled: isFetchStart,
    onSuccess: (data) => {
      setReviews(data);
      setAvailable(true);
      setLoading(false);
    },
  });

  return (
    <button
      onClick={() => {
        setIsFetchStart(true);
        setLoading(true);
        setAvailable(false);
      }}
    >
      수집 시작
    </button>
  );
}
/** 최대 1000개까지의 리뷰를 직접 입력한 바에 따라 수집하는 보버튼 */
export function CustomButton({ companyId, setReviews, setAvailable, setLoading }: ButtonProps) {
  const [isFetchStart, setIsFetchStart] = React.useState(false);
  const [isEntered, setIsEntered] = React.useState(false);
  const [number, setNumber] = React.useState(0);
  const handleCustom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const value = Number(e.currentTarget.value);
      if (value > 1000) {
        alert("1000개 이하로 입력해주세요.");
        return;
      }
      if (value % 5 === 0) {
        setNumber(value);
        setIsFetchStart(true);
        setLoading(true);
        setAvailable(false);
        setIsEntered(false);
      } else {
        alert("5의 배수 단위로 입력해주세요.");
      }
    }
  };

  useQuery(
    ["reviewsCustom", { companyId, number }],
    () => fetchJobPlanetReviewCustom(companyId, number),
    {
      enabled: isFetchStart,
      onSuccess: (data) => {
        setReviews(data);
        setAvailable(true);
        setLoading(false);
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  return (
    <div className="review-custom-card">
      <button
        onClick={() => {
          setAvailable(false);
          setIsEntered(true);
        }}
      >
        갯수 설정
      </button>
      {isEntered && (
        <input
          type="number"
          placeholder="수집할 리뷰의 수를 입력 후 Enter"
          onKeyPress={(e) => {
            handleCustom(e);
          }}
          onBlur={() => {
            setIsEntered(false);
          }}
          autoFocus
        />
      )}
    </div>
  );
}

interface IAutocompleteFormProps {
  autocompleteForm: UseFormReturn<IFormInputs>;
  setAutocomplete: React.Dispatch<React.SetStateAction<ICompany[]>>;
  setCompany: React.Dispatch<React.SetStateAction<ICompany>>;
  setAvailable: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AutocompleteForm({
  autocompleteForm: { register },
  setAutocomplete,
  setCompany,
  setAvailable,
}: IAutocompleteFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <label htmlFor="search">회사 검색</label>
      <input
        type="text"
        id="search"
        {...register("autocomplete", {
          onChange: async (e) => {
            if (e.target.value.trim() === "") {
              setAutocomplete([]);
            } else {
              const data = await fetchJobplanetAutoComplete(e.target.value.trim());
              setAutocomplete(data);
              setCompany(undefined);
              setAvailable(false);
            }
          },
        })}
      />
    </form>
  );
}

interface IAutocompleteListProps {
  autocomplete: ICompany[];
  setCompany: React.Dispatch<React.SetStateAction<ICompany>>;
  setAutocomplete: React.Dispatch<React.SetStateAction<ICompany[]>>;
  autocompleteForm: UseFormReturn<IFormInputs>;
}

export function AutocompleteList({
  autocomplete,
  setCompany,
  setAutocomplete,
  autocompleteForm: { reset },
}: IAutocompleteListProps) {
  return (
    <>
      <article>Review를 수집할 회사를 선택해 주세요</article>
      {autocomplete.map((item) => (
        <div
          key={item.id}
          className="autocomplete-card"
          onClick={() => {
            setCompany(item);
            setAutocomplete([]);
            reset();
          }}
        >
          <img src={item.logoPath} alt={item.name} />
          <strong>{item.name}</strong>
          <small>{item.industryName}</small>
        </div>
      ))}
    </>
  );
}
