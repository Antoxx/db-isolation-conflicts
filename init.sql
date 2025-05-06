CREATE TABLE public.users (
	id serial,
	"password" varchar NULL,
	"name" varchar NULL,
	balance float8 DEFAULT 0 NOT NULL,
	CONSTRAINT users_pk PRIMARY KEY (id)
);

INSERT INTO public.users
(id, "password", "name", balance)
VALUES(1, '123', 'Anton', 100);

CREATE TABLE public.orders (
	id serial,
	"status" varchar NOT NULL,
	CONSTRAINT orders_pk PRIMARY KEY (id)
);