import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { MetaData } from "@/types";

export function useMeta() {
  const [meta, setMeta] = useState<MetaData | null>(null);

  useEffect(() => {
    api.meta().then((response) => setMeta(response.data));
  }, []);

  return meta;
}
