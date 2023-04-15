export function RenderProfile({ defaultLensProfile, isLoggedIn }) {
  let profile = { ...defaultLensProfile.current };
  let picture = profile.picture;
  if (picture && picture.original && picture.original.url) {
    if (picture.original.url.startsWith("ipfs://")) {
      let result = picture.original.url.substring(
        7,
        picture.original.url.length
      );
      profile.avatarUrl = `https://gateway.ipfscdn.io/ipfs/${result}`;
    } else {
      profile.avatarUrl = picture.original.url;
    }
  }
  let coverPicture = profile.coverPicture;
  if (coverPicture && coverPicture.original && coverPicture.original.url) {
    if (coverPicture.original.url.startsWith("ipfs://")) {
      let result = coverPicture.original.url.substring(
        7,
        coverPicture.original.url.length
      );
      profile.avatarCover = `https://gateway.ipfscdn.io/ipfs/${result}`;
    } else {
      profile.avatarCover = coverPicture.original.url;
    }
  }
  return (
    <div>
      <div className="w-fit md:w-1/3">
        <div className="absolute top-0 left-0 flex items-center justify-center w-56 h-56 mt-10 ml-10 bg-black rounded-full">
          <img className="rounded-full w-52 h-52" src={profile.avatarUrl} />
        </div>
        <div className="w-full pt-3 mx-auto mt-10 text-right md:pt-0">
          <div className="text-2xl ">Gm {profile.name}</div>
          <div className="text-gray-300 cursor-pointer text-normal">
            <div className="pb-1 border-gray-500">nice to have you here!</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RenderQueryProfile({ queryProfile }) {
  let profile = queryProfile;
  let picture = profile?.picture;
  if (picture && picture.original && picture.original.url) {
    if (picture.original.url.startsWith("ipfs://")) {
      let result = picture.original.url.substring(
        7,
        picture.original.url.length
      );
      profile.avatarUrl = `https://gateway.ipfscdn.io/ipfs/${result}`;
    } else {
      profile.avatarUrl = picture.original.url;
    }
  }
  return (
    <div>
      <div className="relative w-fit md:w-1/3">
        <div className="absolute top-0 left-0 z-10 flex items-center justify-center w-56 h-56 mt-10 ml-10 bg-black rounded-full">
          {profile ? (
            <img className="rounded-full w-46 h-46" src={profile.avatarUrl} />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}
