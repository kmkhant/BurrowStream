const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 MB";
  return (bytes / 1024 / 1024).toFixed(0) + " MB";
};

const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

export { formatSize, cn };
