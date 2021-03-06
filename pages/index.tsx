import { ExclamationCircleIcon } from "@heroicons/react/solid";
import {
  ErrorValue,
  notEmptyString,
  useField,
  useForm,
} from "@shopify/react-form";
import type { NextPage } from "next";
import Head from "next/head";
import { ChangeEvent } from "react";
import { createRecord, initThinBackend, query } from "thin-backend";
import { useCurrentUser, useQuery } from "thin-backend/react";

initThinBackend({ host: process.env.NEXT_PUBLIC_BACKEND_URL });

const Input: React.FC<{
  label: string;
  value: string;
  onChange: (value: string | ChangeEvent<HTMLInputElement>) => void;
  error: ErrorValue;
  disabled: boolean;
}> = ({ label, value, onChange, error, disabled }) => (
  <div>
    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <input
        type="text"
        onChange={onChange}
        className={`block w-full pr-10 focus:outline-none sm:text-sm rounded-md ${
          error
            ? "focus:ring-red-500 focus:border-red-500 border-red-300 text-red-900 placeholder-red-300"
            : "focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 shadow-sm"
        }`}
        aria-invalid="true"
        aria-describedby="email-error"
        value={value}
        disabled={disabled}
      />
      {error && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ExclamationCircleIcon
            className="h-5 w-5 text-red-500"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

const Textarea: React.FC<{
  label: string;
  value: string;
  onChange: (value: string | ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}> = ({ label, value, onChange, disabled }) => (
  <div>
    <label
      htmlFor="comment"
      className="block text-sm font-medium text-gray-700"
    >
      {label}
    </label>
    <div className="mt-1">
      <textarea
        onChange={({ target }) => onChange(target.value)}
        value={value}
        disabled={disabled}
        rows={4}
        name="comment"
        id="comment"
        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
      />
    </div>
  </div>
);

const AddPost: React.FC = () => {
  const {
    fields: { title, content },
    submit,
    submitting,
    reset,
  } = useForm({
    fields: {
      title: useField({
        value: "",
        validates: notEmptyString("Title is required"),
      }),
      content: useField(""),
    },

    onSubmit: async (fieldValues) => {
      await createRecord("posts", {
        title: fieldValues.title,
        content: fieldValues.content,
      });
      reset();
      return { status: "success" };
    },
  });

  return (
    <form onSubmit={submit}>
      <div className="space-y-4">
        <Input
          value={title.value}
          onChange={title.onChange}
          label={"Title"}
          error={title.error}
          disabled={submitting}
        />
        <Textarea
          value={content.value}
          onChange={content.onChange}
          label={"Content"}
          disabled={submitting}
        />
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Post
        </button>
      </div>
    </form>
  );
};

const Home: NextPage = () => {
  const user = useCurrentUser();
  const posts = useQuery(query("posts").orderBy("title"));

  return (
    <div className="">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-xl mb-4 font-bold">
          {user ? user.email : "No user"}
        </h1>

        <div className="mb-4">
          {posts && posts.length > 0 ? (
            <div className="mb-4">
              {posts.map(({ id, title }) => (
                <div key={id}>{title}</div>
              ))}
            </div>
          ) : (
            <div>No posts</div>
          )}
        </div>

        <div>
          <AddPost />
        </div>
      </main>
    </div>
  );
};

export default Home;
