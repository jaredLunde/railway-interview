export function Texture() {
  return (
    <div
      className="absolute inset-0"
      style={{
        zIndex: -1,
        backgroundImage:
          `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 8 8'%3E%3Cg fill='%239C92AC' fill-opacity='0.033'%3E%3Cpath fill-rule='evenodd' d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  );
}
