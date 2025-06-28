# Changelog

## [1.2.0](https://github.com/KKamJi98/image-converter/compare/v1.1.0...v1.2.0) (2025-06-28)


### Features

* Improve backend Dockerfile for security and efficiency ([b2bcb4d](https://github.com/KKamJi98/image-converter/commit/b2bcb4de40bc215db0a1d2e2f2b16c06f760e0bc))


### Bug Fixes

* Correct Dockerfile COPY path for backend app\n\nThe Dockerfile for the backend was attempting to copy 'backend/app'\nwhich resulted in a build error when the build context was the 'backend'\ndirectory itself. This commit corrects the COPY instruction to\n'COPY app ./app' to properly reference the application directory\nrelative to the Dockerfile's location. ([00369d4](https://github.com/KKamJi98/image-converter/commit/00369d4753bc03359fb8a9d9298de9218c0ed913))
* Correct Dockerfile COPY paths for backend dependencies\n\nThe Dockerfile for the backend was attempting to copy 'backend/pyproject.toml',\n'backend/requirements.txt', and 'backend/requirements-dev.txt' which resulted\nin build errors when the build context was the 'backend' directory itself.\nThis commit corrects these COPY instructions to properly reference the files\nrelative to the Dockerfile's location. ([c663ecc](https://github.com/KKamJi98/image-converter/commit/c663ecc5305c8f6915506ac8b3662d210fe60452))


### Documentation

* Update CHANGELOG.md with 1.0.0 release notes and remove old files ([003bc57](https://github.com/KKamJi98/image-converter/commit/003bc576b37303bcc86611e7735894907a8646f6))

## [1.1.0](https://github.com/KKamJi98/image-converter/compare/v1.0.0...v1.1.0) (2025-06-28)


### Features

* display converted image size ([f49a04e](https://github.com/KKamJi98/image-converter/commit/f49a04ed96fbec13392e454f5ae9c275319c0871))
* display converted image size ([bb1dce4](https://github.com/KKamJi98/image-converter/commit/bb1dce43ec49684d9cd47288f4f21581e0a1d3ac))
* extend image API timeout ([292dae5](https://github.com/KKamJi98/image-converter/commit/292dae584b0f1efa413079ee1020f809adaf6e1c))
* **frontend:** use bundled favicon ([3883262](https://github.com/KKamJi98/image-converter/commit/388326287d1e45a16cc17665db1ab81a3d6c5bfd))
* improve logging and clarify api base ([c0aa7c5](https://github.com/KKamJi98/image-converter/commit/c0aa7c55cd6d9d3bf9e364d01c2c0cbbd0cf658e))
* parameterize backend endpoint ([4bff853](https://github.com/KKamJi98/image-converter/commit/4bff853fe0209a0564dd794eefc8851fe91f520c))
* show converted image size in MB ([a4636fd](https://github.com/KKamJi98/image-converter/commit/a4636fd238e68bc898b7a3056e3647331b7031c4))
* show image size in KB or MB ([f89bc55](https://github.com/KKamJi98/image-converter/commit/f89bc5521ea36d7ffaafd8f391a59c1616a13332))
* support direct backend endpoint and docs path ([59024e1](https://github.com/KKamJi98/image-converter/commit/59024e1d6991d3d2344e606946d446d986c632a9))
* Update CI workflow and remove old agent files ([64748ed](https://github.com/KKamJi98/image-converter/commit/64748ed494b5e1b00a55faf9362195a670eb657b))


### Bug Fixes

* avoid replicas field with HPA ([f19253c](https://github.com/KKamJi98/image-converter/commit/f19253c37650122793702ae6d4c270c19d0ed2a7))
* **ci:** correct image tag format ([e4a53b8](https://github.com/KKamJi98/image-converter/commit/e4a53b8f96d9f99d49e7395c62177a7fe9c9c1af))
* correct api path and ingress rewrite ([4b9c45b](https://github.com/KKamJi98/image-converter/commit/4b9c45b22e70cadb916db6ae081342015a8b8b35))
* correct backend proxy path ([5564e8f](https://github.com/KKamJi98/image-converter/commit/5564e8fcdd3739cc608c7a7ba2d7a63e796db4aa))
* Disable Docker Hub push in CI build step ([8ca1691](https://github.com/KKamJi98/image-converter/commit/8ca169196c51e7927573f80f09f415b0b71579e5))
* improve logging and error handling ([079c7d3](https://github.com/KKamJi98/image-converter/commit/079c7d34b453a1b7278aec9ecc515618738a6d1d))
* Update backend Dockerfile to upgrade system packages for CVEs ([4e1e04b](https://github.com/KKamJi98/image-converter/commit/4e1e04ba0b7b429c1f254752d211921951c4fea6))
* update container image name and helm chart values ([62a400f](https://github.com/KKamJi98/image-converter/commit/62a400f721d7462a621b81d31f5fe288416de3a2))
* update helm endpoints and test script ([411b821](https://github.com/KKamJi98/image-converter/commit/411b8210157478350e4b13c13992bfca1519f3d5))


### Documentation

* add main page image ([a8fa8f8](https://github.com/KKamJi98/image-converter/commit/a8fa8f8dbd1b15343b58c2c1799995bb416a403c))
* update guidelines and readme ([2131388](https://github.com/KKamJi98/image-converter/commit/2131388a83317dcfcca396779ac912b881c66fac))
* update requirements ([45382f9](https://github.com/KKamJi98/image-converter/commit/45382f979066aed405d5fb22ffe4f7c45ae8ddfe))
* update requirements & setup scripts ([10d63eb](https://github.com/KKamJi98/image-converter/commit/10d63ebafa496e542d64a4b997eb5d1fb65d1bec))

## [1.0.0] - 2025-06-11

### Features

* Initial project setup with FastAPI backend and React/TypeScript frontend.
* Implemented drag-and-drop file upload, real-time progress, and dark theme support.
* Configured Docker and Docker Compose.
* Set up Kubernetes Helm charts.
* Established GitHub Actions CI/CD pipeline.
* Implemented automated testing scripts (`run_and_test.sh`).
* Added WebP ↔ JPEG/PNG/JPG bidirectional conversion.
* Implemented image resizing and file size optimization.
* Completed API specification and documentation structure.
* Updated domain information for Harbor and service.
* Configured production environment settings and improved testing.
* Changed dependency management tool from Poetry to uv for faster package installation.
* Achieved 100% test pass rate for frontend and backend.
* Verified Infra Helm Chart and service interconnections.
* Improved image conversion quality and UI.

### Bug Fixes

* Resolved CI pipeline and E2E test issues (Node.js caching, container orchestration).
* Fixed React test warnings (`act()` function).
* Addressed npm security vulnerabilities.
* Improved backend health check settings.
* Resolved Docker/Podman compatibility issues.
* Fixed conversion progress animation bug.
* Corrected JPG output to JPEG format.

### Documentation

* Created `docs/api-spec.md` for API specification.
* Documented Frontend structure (`frontend/README.md`).
* Documented Backend API structure (`backend/README.md`).
* Documented Infrastructure structure (`infra/README.md`).

