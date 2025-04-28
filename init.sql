CREATE TABLE public.users (
	id int4 NOT NULL,
	"password" varchar NULL,
	"name" varchar NULL,
	balance float8 DEFAULT 0 NOT NULL,
	CONSTRAINT users_pk PRIMARY KEY (id)
);

INSERT INTO public.users
(id, "password", "name", balance)
VALUES(1, '123', 'Anton', 100);
