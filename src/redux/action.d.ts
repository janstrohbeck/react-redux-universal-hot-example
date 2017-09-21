interface Action {
  type: string;
  payload?: any;
  result?: any;
  error?: any;
}

export default Action;
