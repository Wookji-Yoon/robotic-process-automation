import { IReviews } from "./pages/Review";

const base_heroku_api_url = "https://wookji-fastapi.herokuapp.com/";

export async function fetchJobplanetAutoComplete(keyword: string) {
  const response = await fetch(base_heroku_api_url + "jobplanet/autocomplete?keyword=" + keyword);
  const data = await response.json();
  const newData = data.map((item: any) => ({
    id: item.id,
    name: item.name,
    industryName: item.industry_name,
    logoPath: item.logo_path,
  }));
  return newData;
}

//default로 review를 가져오는 함수 (250개, 혹은 3개년)
export async function fetchJobplanetReviewDefault(company_id: number) {
  const response = await fetch(base_heroku_api_url + "jobplanet/review?company_id=" + company_id);
  const data = await response.json();
  return data;
}

//원하는 리뷰개수만큼 review를 가져오는 함수
export async function fetchJobPlanetReviewCustom(company_id: number, number: number) {
  const page = number / 5;
  let first_page = 1;
  let last_page = first_page + 49 > page ? page : first_page + 49;
  let finalData: IReviews;

  while (page > first_page) {
    const response = await fetch(
      base_heroku_api_url +
        "jobplanet/review?company_id=" +
        company_id +
        "&first_page=" +
        first_page +
        " &last_page=" +
        last_page
    );
    const data = await response.json();

    //데이터를 합치는 부분
    if (first_page === 1) {
      finalData = data;
    } else {
      finalData.content = finalData.content.concat(data.content);
    }
    first_page = first_page + 50;
    last_page = first_page + 49 > page ? page : first_page + 49;
  }
  return finalData;
}

//counter 되어 있는 한글형태소 분석을 가져오는 함수
export async function fetchWordCloud(text: string) {
  const response = await fetch(base_heroku_api_url + "wordcloud", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text }),
  });
  const data = await response.json();
  return data;
}

export async function fetchWordCloudImage(text: string) {
  const response = await fetch(base_heroku_api_url + "wordcloud/createimage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text }),
  });
  //image를 response로 받아오므로 data 처리
  const data = await response.blob();
  return data;
}
