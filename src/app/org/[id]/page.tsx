"use client";
import React, { useEffect, useState } from "react";
import { useOrg } from "../hooks/useOrg";

type Props = { params: Promise<{ id: string }> };
export default function ManageOrg({ params }: Props) {
  const { getOrgProjects, fetchOrgDetails } = useOrg();
  const [details, setDetails] = useState({});
  const [orgProjects, setOrgProjects] = useState<any[]>([]);
  const { id } = React.use(params);
  useEffect(() => {
    const getProjects = async () => {
      const res = await getOrgProjects(id);
      setOrgProjects(res.data);
    };

    const fetchDetails = async () => {
      const res = await fetchOrgDetails(id);
      if (res.data) {
        console.log(res.data);
        setDetails(res.data);
      }
    };

    fetchDetails();
    getProjects();
  }, [id]);
  console.log(orgProjects);
  return (
    <div>
      <p>{id}</p>
    </div>
  );
}
