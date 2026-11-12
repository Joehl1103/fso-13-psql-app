interface RequestParams {}

interface ResponseBody {}

interface RequestBody {}

type RequestQuery<K extends string> =  {
  [Key in K]?: string;
}

export type { RequestParams, ResponseBody, RequestBody, RequestQuery };
