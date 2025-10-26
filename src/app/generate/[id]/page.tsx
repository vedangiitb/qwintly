"use client";
type Props = { params: { id: string } };

export default function Generate({ params }: Props) {
  // Something like useEffect which sees if prompt is not empty and then creates an SSE
  // prompt is accessed from useInitConv
  // while navigating from a page having prompt typed or sent, first clear the prompt before navigating
  const { id } = params;
  return <div>The id is: {id}</div>;
}
