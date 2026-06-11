-- Convert price list bullet points from plain strings to structured JSON objects.
ALTER TABLE "PriceListService"
ALTER COLUMN "bulletPoints" DROP DEFAULT;

ALTER TABLE "PriceListService"
ALTER COLUMN "bulletPoints" SET DATA TYPE JSONB
USING COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'label', elem,
        'duration', NULL,
        'cost', NULL
      )
    )
    FROM unnest("bulletPoints") AS elem
  ),
  '[]'::jsonb
);

ALTER TABLE "PriceListService"
ALTER COLUMN "bulletPoints" SET DEFAULT '[]'::jsonb;
