import React from "react";

type Props = { params: Promise<{ id: string }> };
export default function ManageOrg({ params }: Props) {
  const { id } = React.use(params);
  return (
    <div>
      <p>{id}</p>
    </div>
  );
}
