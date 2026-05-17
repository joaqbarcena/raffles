"use client";

interface Props {
  raffleId: string;
  title: string;
}

export default function ImageExport({ raffleId, title }: Props) {
  const filename = title.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="mt-4 text-center">
      <a
        href={`/api/export/${raffleId}`}
        download={filename}
        className="inline-block rounded-lg bg-green-600 px-5 py-2 text-sm text-white hover:bg-green-700 active:bg-green-800"
      >
        Descargar PNG
      </a>
    </div>
  );
}
