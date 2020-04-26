DROP TABLE IF EXISTS mydigitals;
CREAtE TABLE mydigitals(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    img_url VARCHAR(255),
    level VARCHAR(255)
);