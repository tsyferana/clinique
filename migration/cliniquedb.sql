--
-- PostgreSQL database dump
--

\restrict EVI5FjWHBotB8kthTUWBU2YYyjX491VFdBbikUkRRmLGBnQwzLsYai6RUHwcc0W

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

-- Started on 2026-07-22 00:49:42

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 867 (class 1247 OID 17036)
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'RESCHEDULED',
    'ARRIVED',
    'IN_QUEUE',
    'IN_CONSULTATION',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."AppointmentStatus" OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 17078)
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'APPOINTMENT',
    'QUEUE',
    'CONSULTATION',
    'SYSTEM'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- TOC entry 870 (class 1247 OID 17058)
-- Name: QueueStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QueueStatus" AS ENUM (
    'WAITING',
    'CALLED',
    'IN_CONSULTATION',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."QueueStatus" OWNER TO postgres;

--
-- TOC entry 873 (class 1247 OID 17070)
-- Name: UnavailabilityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UnavailabilityType" AS ENUM (
    'BLOCKED',
    'LEAVE',
    'ABSENCE'
);


ALTER TYPE public."UnavailabilityType" OWNER TO postgres;

--
-- TOC entry 864 (class 1247 OID 17026)
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'PATIENT',
    'STAFF',
    'DOCTOR',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 17178)
-- Name: Appointment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Appointment" (
    id text NOT NULL,
    patient_id text NOT NULL,
    doctor_id text,
    service_id text NOT NULL,
    appointment_date text NOT NULL,
    appointment_time text NOT NULL,
    status public."AppointmentStatus" NOT NULL,
    reason text NOT NULL,
    description text,
    ticket_number text,
    ticket_code text,
    rejection_reason text,
    rescheduled_date text,
    rescheduled_time text,
    is_walk_in boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Appointment" OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17215)
-- Name: Consultation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Consultation" (
    id text NOT NULL,
    appointment_id text,
    patient_id text NOT NULL,
    doctor_id text NOT NULL,
    date text NOT NULL,
    reason text NOT NULL,
    symptoms text NOT NULL,
    temperature double precision,
    weight double precision,
    blood_pressure text,
    diagnosis text NOT NULL,
    observations text,
    treatment_plan text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Consultation" OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17293)
-- Name: DoctorUnavailability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DoctorUnavailability" (
    id text NOT NULL,
    doctor_id text NOT NULL,
    type public."UnavailabilityType" NOT NULL,
    title text NOT NULL,
    start_date text NOT NULL,
    end_date text NOT NULL,
    start_time text,
    end_time text,
    is_all_day boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DoctorUnavailability" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17278)
-- Name: DoctorWorkingHours; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."DoctorWorkingHours" (
    id text NOT NULL,
    doctor_id text NOT NULL,
    day_of_week integer NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    slot_duration_minutes integer NOT NULL,
    lunch_start text,
    lunch_end text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public."DoctorWorkingHours" OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17161)
-- Name: MedicalService; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MedicalService" (
    id text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    duration_minutes integer NOT NULL,
    price double precision NOT NULL,
    icon text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MedicalService" OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17262)
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    user_id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    type public."NotificationType" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17233)
-- Name: Prescription; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Prescription" (
    id text NOT NULL,
    consultation_id text NOT NULL,
    patient_id text NOT NULL,
    doctor_id text NOT NULL,
    date text NOT NULL,
    diagnosis text NOT NULL,
    recommendations text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Prescription" OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17249)
-- Name: PrescriptionItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."PrescriptionItem" (
    id text NOT NULL,
    prescription_id text NOT NULL,
    medication_name text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    duration text NOT NULL,
    instructions text
);


ALTER TABLE public."PrescriptionItem" OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17122)
-- Name: ProfileDoctor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProfileDoctor" (
    id text NOT NULL,
    user_id text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    specialty text NOT NULL,
    license_number text NOT NULL,
    cabinet_number text NOT NULL,
    service_id text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProfileDoctor" OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17106)
-- Name: ProfilePatient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProfilePatient" (
    id text NOT NULL,
    user_id text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    gender text NOT NULL,
    birth_date text NOT NULL,
    phone text NOT NULL,
    email text,
    address text,
    blood_group text,
    allergies text,
    medical_history text,
    emergency_contact text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProfilePatient" OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17144)
-- Name: ProfileStaff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ProfileStaff" (
    id text NOT NULL,
    user_id text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    email text NOT NULL,
    department text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProfileStaff" OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17197)
-- Name: QueueEntry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."QueueEntry" (
    id text NOT NULL,
    appointment_id text,
    patient_id text NOT NULL,
    doctor_id text NOT NULL,
    service_id text NOT NULL,
    ticket_number text NOT NULL,
    "position" integer NOT NULL,
    status public."QueueStatus" NOT NULL,
    arrival_time timestamp(3) without time zone NOT NULL,
    called_time timestamp(3) without time zone,
    start_time timestamp(3) without time zone,
    end_time timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."QueueEntry" OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17087)
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public."UserRole" NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- TOC entry 5038 (class 0 OID 17178)
-- Dependencies: 224
-- Data for Name: Appointment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Appointment" (id, patient_id, doctor_id, service_id, appointment_date, appointment_time, status, reason, description, ticket_number, ticket_code, rejection_reason, rescheduled_date, rescheduled_time, is_walk_in, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5040 (class 0 OID 17215)
-- Dependencies: 226
-- Data for Name: Consultation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Consultation" (id, appointment_id, patient_id, doctor_id, date, reason, symptoms, temperature, weight, blood_pressure, diagnosis, observations, treatment_plan, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5045 (class 0 OID 17293)
-- Dependencies: 231
-- Data for Name: DoctorUnavailability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DoctorUnavailability" (id, doctor_id, type, title, start_date, end_date, start_time, end_time, is_all_day, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5044 (class 0 OID 17278)
-- Dependencies: 230
-- Data for Name: DoctorWorkingHours; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."DoctorWorkingHours" (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, lunch_start, lunch_end, is_active) FROM stdin;
8645cfbb-ea84-4322-bcea-5fe7a28937a1	54f6a746-6ad6-4401-a0ca-afc368995078	1	08:00	17:00	30	\N	\N	t
f4db32aa-b483-4fac-a8ab-18c24d28018b	3a524849-ec2d-4c68-bc2c-e8249f24d8e9	1	09:00	16:00	45	\N	\N	t
b9196a08-47c1-4b98-9876-988b864ea472	54f6a746-6ad6-4401-a0ca-afc368995078	2	08:00	17:00	30	\N	\N	t
6622ed68-56d7-4cad-ac22-2baa38ea21af	3a524849-ec2d-4c68-bc2c-e8249f24d8e9	2	09:00	16:00	45	\N	\N	t
5da99b34-457d-4921-a62a-3cc45842dd37	54f6a746-6ad6-4401-a0ca-afc368995078	3	08:00	17:00	30	\N	\N	t
7418d253-6edd-433c-8c0b-6bd412a4301e	3a524849-ec2d-4c68-bc2c-e8249f24d8e9	3	09:00	16:00	45	\N	\N	t
8a28f4a3-a709-4e28-bcb8-91e7e30f0a03	54f6a746-6ad6-4401-a0ca-afc368995078	4	08:00	17:00	30	\N	\N	t
c2c7996b-7572-4720-8775-fcf16e005bfd	3a524849-ec2d-4c68-bc2c-e8249f24d8e9	4	09:00	16:00	45	\N	\N	t
ede47399-d895-483f-851f-3f1b9b389b3f	54f6a746-6ad6-4401-a0ca-afc368995078	5	08:00	17:00	30	\N	\N	t
96b2b1b1-d93c-4c6b-a13a-b7877e215ba6	3a524849-ec2d-4c68-bc2c-e8249f24d8e9	5	09:00	16:00	45	\N	\N	t
\.


--
-- TOC entry 5037 (class 0 OID 17161)
-- Dependencies: 223
-- Data for Name: MedicalService; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."MedicalService" (id, name, description, duration_minutes, price, icon, is_active, created_at, updated_at) FROM stdin;
ffcab185-7983-4d59-99cc-c8e0c8c9caf4	Médecine Générale	Consultations générales et suivis	30	50	\N	t	2026-07-21 23:08:42.589	2026-07-21 23:08:42.589
5609b5a6-57f7-4290-99a2-38396f8f5aa0	Cardiologie	Maladies du cœur et des vaisseaux	45	80	\N	t	2026-07-21 23:08:42.592	2026-07-21 23:08:42.592
35c52988-e6c8-44a4-9078-073361aebd64	Dermatologie	Maladies de la peau	20	70	\N	t	2026-07-21 23:08:42.595	2026-07-21 23:08:42.595
50b2e9f3-70b5-4142-8911-6084d1d090b2	Gynécologie	Santé de la femme	30	65	\N	t	2026-07-21 23:08:42.597	2026-07-21 23:08:42.597
ad071ef8-cdf3-4443-8395-df2b18179252	test	Médecine des enfants	30	60	\N	t	2026-07-21 23:08:42.594	2026-07-21 23:35:54.334
46b2086a-1fa6-42d5-ac27-ca74713b2185	Test Service	Desc	30	50	\N	t	2026-07-21 23:42:27.175	2026-07-21 23:42:27.175
\.


--
-- TOC entry 5043 (class 0 OID 17262)
-- Dependencies: 229
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, user_id, title, message, is_read, type, created_at) FROM stdin;
\.


--
-- TOC entry 5041 (class 0 OID 17233)
-- Dependencies: 227
-- Data for Name: Prescription; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Prescription" (id, consultation_id, patient_id, doctor_id, date, diagnosis, recommendations, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5042 (class 0 OID 17249)
-- Dependencies: 228
-- Data for Name: PrescriptionItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."PrescriptionItem" (id, prescription_id, medication_name, dosage, frequency, duration, instructions) FROM stdin;
\.


--
-- TOC entry 5035 (class 0 OID 17122)
-- Dependencies: 221
-- Data for Name: ProfileDoctor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProfileDoctor" (id, user_id, first_name, last_name, specialty, license_number, cabinet_number, service_id, phone, email, is_available, created_at, updated_at) FROM stdin;
54f6a746-6ad6-4401-a0ca-afc368995078	94aa6ec2-236b-4277-810a-56553157273a	Jean	Dupont	Médecine Générale	MED-12345	Cab 1	ffcab185-7983-4d59-99cc-c8e0c8c9caf4	0340000002	dr.dupont@clinique.com	t	2026-07-21 23:08:42.702	2026-07-21 23:08:42.702
3a524849-ec2d-4c68-bc2c-e8249f24d8e9	2797b96b-16e7-4058-b3d1-584028a93564	Claire	Martin	Cardiologie	MED-67890	Cab 2	5609b5a6-57f7-4290-99a2-38396f8f5aa0	0340000003	dr.martin@clinique.com	t	2026-07-21 23:08:42.706	2026-07-21 23:08:42.706
\.


--
-- TOC entry 5034 (class 0 OID 17106)
-- Dependencies: 220
-- Data for Name: ProfilePatient; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProfilePatient" (id, user_id, first_name, last_name, gender, birth_date, phone, email, address, blood_group, allergies, medical_history, emergency_contact, created_at, updated_at) FROM stdin;
cf56e38f-da87-4236-95bc-5ecce861bb79	857bb03d-a129-4a06-9183-f2d7331f990e	Bob	Testeur	M	1990-05-15T00:00:00Z	0340000005	patient@example.com	123 Rue de la Santé	O+	\N	\N	\N	2026-07-21 23:08:42.711	2026-07-21 23:08:42.711
\.


--
-- TOC entry 5036 (class 0 OID 17144)
-- Dependencies: 222
-- Data for Name: ProfileStaff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ProfileStaff" (id, user_id, first_name, last_name, phone, email, department, created_at, updated_at) FROM stdin;
a2138cd6-4ab8-446d-a744-ab360f6c7313	253b3f8f-aa09-45a5-adde-b9a63f58e4f2	Alice	Accueil	0340000004	accueil@clinique.com	Réception	2026-07-21 23:08:42.708	2026-07-21 23:08:42.708
\.


--
-- TOC entry 5039 (class 0 OID 17197)
-- Dependencies: 225
-- Data for Name: QueueEntry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."QueueEntry" (id, appointment_id, patient_id, doctor_id, service_id, ticket_number, "position", status, arrival_time, called_time, start_time, end_time, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5033 (class 0 OID 17087)
-- Dependencies: 219
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password_hash, role, first_name, last_name, phone, is_active, created_at, updated_at) FROM stdin;
5bc6efcc-1f32-4120-83cb-56cd3b4acbab	admin@clinique.com	$2b$10$dKf.zjMB7alwL6VsMfwoRuoSnTTLxLyKCIeufE8m0cx92nschi2ea	ADMIN	Super	Admin	0340000001	t	2026-07-21 23:08:42.691	2026-07-21 23:08:42.691
94aa6ec2-236b-4277-810a-56553157273a	dr.dupont@clinique.com	$2b$10$dKf.zjMB7alwL6VsMfwoRuoSnTTLxLyKCIeufE8m0cx92nschi2ea	DOCTOR	Jean	Dupont	0340000002	t	2026-07-21 23:08:42.694	2026-07-21 23:08:42.694
2797b96b-16e7-4058-b3d1-584028a93564	dr.martin@clinique.com	$2b$10$dKf.zjMB7alwL6VsMfwoRuoSnTTLxLyKCIeufE8m0cx92nschi2ea	DOCTOR	Claire	Martin	0340000003	t	2026-07-21 23:08:42.696	2026-07-21 23:08:42.696
253b3f8f-aa09-45a5-adde-b9a63f58e4f2	accueil@clinique.com	$2b$10$dKf.zjMB7alwL6VsMfwoRuoSnTTLxLyKCIeufE8m0cx92nschi2ea	STAFF	Alice	Accueil	0340000004	t	2026-07-21 23:08:42.698	2026-07-21 23:08:42.698
857bb03d-a129-4a06-9183-f2d7331f990e	patient@example.com	$2b$10$dKf.zjMB7alwL6VsMfwoRuoSnTTLxLyKCIeufE8m0cx92nschi2ea	PATIENT	Bob	Testeur	0340000005	t	2026-07-21 23:08:42.7	2026-07-21 23:08:42.7
\.


--
-- TOC entry 4850 (class 2606 OID 17196)
-- Name: Appointment Appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);


--
-- TOC entry 4854 (class 2606 OID 17232)
-- Name: Consultation Consultation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_pkey" PRIMARY KEY (id);


--
-- TOC entry 4864 (class 2606 OID 17310)
-- Name: DoctorUnavailability DoctorUnavailability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorUnavailability"
    ADD CONSTRAINT "DoctorUnavailability_pkey" PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 17292)
-- Name: DoctorWorkingHours DoctorWorkingHours_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorWorkingHours"
    ADD CONSTRAINT "DoctorWorkingHours_pkey" PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 17177)
-- Name: MedicalService MedicalService_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalService"
    ADD CONSTRAINT "MedicalService_pkey" PRIMARY KEY (id);


--
-- TOC entry 4860 (class 2606 OID 17277)
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 17261)
-- Name: PrescriptionItem PrescriptionItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrescriptionItem"
    ADD CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 4856 (class 2606 OID 17248)
-- Name: Prescription Prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_pkey" PRIMARY KEY (id);


--
-- TOC entry 4842 (class 2606 OID 17143)
-- Name: ProfileDoctor ProfileDoctor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfileDoctor"
    ADD CONSTRAINT "ProfileDoctor_pkey" PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 17121)
-- Name: ProfilePatient ProfilePatient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfilePatient"
    ADD CONSTRAINT "ProfilePatient_pkey" PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 17160)
-- Name: ProfileStaff ProfileStaff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfileStaff"
    ADD CONSTRAINT "ProfileStaff_pkey" PRIMARY KEY (id);


--
-- TOC entry 4852 (class 2606 OID 17214)
-- Name: QueueEntry QueueEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QueueEntry"
    ADD CONSTRAINT "QueueEntry_pkey" PRIMARY KEY (id);


--
-- TOC entry 4837 (class 2606 OID 17105)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 4843 (class 1259 OID 17313)
-- Name: ProfileDoctor_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProfileDoctor_user_id_key" ON public."ProfileDoctor" USING btree (user_id);


--
-- TOC entry 4840 (class 1259 OID 17312)
-- Name: ProfilePatient_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProfilePatient_user_id_key" ON public."ProfilePatient" USING btree (user_id);


--
-- TOC entry 4846 (class 1259 OID 17314)
-- Name: ProfileStaff_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ProfileStaff_user_id_key" ON public."ProfileStaff" USING btree (user_id);


--
-- TOC entry 4835 (class 1259 OID 17311)
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- TOC entry 4869 (class 2606 OID 17340)
-- Name: Appointment Appointment_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."ProfileDoctor"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4870 (class 2606 OID 17335)
-- Name: Appointment Appointment_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public."ProfilePatient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4871 (class 2606 OID 17345)
-- Name: Appointment Appointment_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public."MedicalService"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4876 (class 2606 OID 17370)
-- Name: Consultation Consultation_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4877 (class 2606 OID 17380)
-- Name: Consultation Consultation_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."ProfileDoctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4878 (class 2606 OID 17375)
-- Name: Consultation Consultation_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Consultation"
    ADD CONSTRAINT "Consultation_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public."ProfilePatient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4885 (class 2606 OID 17415)
-- Name: DoctorUnavailability DoctorUnavailability_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorUnavailability"
    ADD CONSTRAINT "DoctorUnavailability_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."ProfileDoctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4884 (class 2606 OID 17410)
-- Name: DoctorWorkingHours DoctorWorkingHours_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."DoctorWorkingHours"
    ADD CONSTRAINT "DoctorWorkingHours_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."ProfileDoctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4883 (class 2606 OID 17405)
-- Name: Notification Notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4882 (class 2606 OID 17400)
-- Name: PrescriptionItem PrescriptionItem_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."PrescriptionItem"
    ADD CONSTRAINT "PrescriptionItem_prescription_id_fkey" FOREIGN KEY (prescription_id) REFERENCES public."Prescription"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4879 (class 2606 OID 17385)
-- Name: Prescription Prescription_consultation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_consultation_id_fkey" FOREIGN KEY (consultation_id) REFERENCES public."Consultation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4880 (class 2606 OID 17395)
-- Name: Prescription Prescription_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."ProfileDoctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4881 (class 2606 OID 17390)
-- Name: Prescription Prescription_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public."ProfilePatient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4866 (class 2606 OID 17325)
-- Name: ProfileDoctor ProfileDoctor_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfileDoctor"
    ADD CONSTRAINT "ProfileDoctor_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public."MedicalService"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4867 (class 2606 OID 17320)
-- Name: ProfileDoctor ProfileDoctor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfileDoctor"
    ADD CONSTRAINT "ProfileDoctor_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4865 (class 2606 OID 17315)
-- Name: ProfilePatient ProfilePatient_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfilePatient"
    ADD CONSTRAINT "ProfilePatient_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4868 (class 2606 OID 17330)
-- Name: ProfileStaff ProfileStaff_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ProfileStaff"
    ADD CONSTRAINT "ProfileStaff_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4872 (class 2606 OID 17350)
-- Name: QueueEntry QueueEntry_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QueueEntry"
    ADD CONSTRAINT "QueueEntry_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4873 (class 2606 OID 17360)
-- Name: QueueEntry QueueEntry_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QueueEntry"
    ADD CONSTRAINT "QueueEntry_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES public."ProfileDoctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4874 (class 2606 OID 17355)
-- Name: QueueEntry QueueEntry_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QueueEntry"
    ADD CONSTRAINT "QueueEntry_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES public."ProfilePatient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4875 (class 2606 OID 17365)
-- Name: QueueEntry QueueEntry_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."QueueEntry"
    ADD CONSTRAINT "QueueEntry_service_id_fkey" FOREIGN KEY (service_id) REFERENCES public."MedicalService"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-07-22 00:49:42

--
-- PostgreSQL database dump complete
--

\unrestrict EVI5FjWHBotB8kthTUWBU2YYyjX491VFdBbikUkRRmLGBnQwzLsYai6RUHwcc0W

