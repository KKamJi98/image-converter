# Changelog

## [0.2.0](https://github.com/KKamJi98/image-converter/compare/v0.1.0...v0.2.0) (2025-09-27)


### Features

* display converted image size ([f49a04e](https://github.com/KKamJi98/image-converter/commit/f49a04ed96fbec13392e454f5ae9c275319c0871))
* display converted image size ([bb1dce4](https://github.com/KKamJi98/image-converter/commit/bb1dce43ec49684d9cd47288f4f21581e0a1d3ac))
* Improve backend Dockerfile for security and efficiency ([b2bcb4d](https://github.com/KKamJi98/image-converter/commit/b2bcb4de40bc215db0a1d2e2f2b16c06f760e0bc))
* improve logging and clarify api base ([c0aa7c5](https://github.com/KKamJi98/image-converter/commit/c0aa7c55cd6d9d3bf9e364d01c2c0cbbd0cf658e))
* initial project setup with FastAPI backend and React frontend ([7722bb1](https://github.com/KKamJi98/image-converter/commit/7722bb1e025262021c73b566be1ece9856d304fa))
* npm 모듈 최신화 및 테스트 인프라 개선 ([24724d0](https://github.com/KKamJi98/image-converter/commit/24724d0f9f1809f275349e000088c66dffdfd923))
* show image size in KB or MB ([f89bc55](https://github.com/KKamJi98/image-converter/commit/f89bc5521ea36d7ffaafd8f391a59c1616a13332))
* support direct backend endpoint and docs path ([59024e1](https://github.com/KKamJi98/image-converter/commit/59024e1d6991d3d2344e606946d446d986c632a9))
* surface conversion metadata in ui flow ([5dcefb3](https://github.com/KKamJi98/image-converter/commit/5dcefb32e65f0a41dde4d53c7dc54e0cec843844))
* update dependencies to latest versions ([abb5f4f](https://github.com/KKamJi98/image-converter/commit/abb5f4f362bab730f765f0da81326f5429f21d17))


### Bug Fixes

* Correct Dockerfile COPY path for backend app\n\nThe Dockerfile for the backend was attempting to copy 'backend/app'\nwhich resulted in a build error when the build context was the 'backend'\ndirectory itself. This commit corrects the COPY instruction to\n'COPY app ./app' to properly reference the application directory\nrelative to the Dockerfile's location. ([00369d4](https://github.com/KKamJi98/image-converter/commit/00369d4753bc03359fb8a9d9298de9218c0ed913))
* Correct Dockerfile COPY paths for backend dependencies\n\nThe Dockerfile for the backend was attempting to copy 'backend/pyproject.toml',\n'backend/requirements.txt', and 'backend/requirements-dev.txt' which resulted\nin build errors when the build context was the 'backend' directory itself.\nThis commit corrects these COPY instructions to properly reference the files\nrelative to the Dockerfile's location. ([c663ecc](https://github.com/KKamJi98/image-converter/commit/c663ecc5305c8f6915506ac8b3662d210fe60452))
* Dockerfile 수정으로 CI 테스트 통과 ([ec64aa2](https://github.com/KKamJi98/image-converter/commit/ec64aa2d71b51ae87bf07d253110c666cdec7389))
* ensure Alpine build deps for pyvips and document in README/AGENTS ([c987916](https://github.com/KKamJi98/image-converter/commit/c9879164160d7839fe91bd9add333678033a8d24))
* improve logging and error handling ([079c7d3](https://github.com/KKamJi98/image-converter/commit/079c7d34b453a1b7278aec9ecc515618738a6d1d))
* migrate to Pydantic v2 field_validator ([028580e](https://github.com/KKamJi98/image-converter/commit/028580e40e89e185532a49abe733d29a7b3f0fbc))
* resolve CI pipeline and nginx configuration issues ([6f999dd](https://github.com/KKamJi98/image-converter/commit/6f999dda46857df9d8e5645fda3a2996f1cb22d7))
* show whole-second progress and lossless webp ([9f6e26a](https://github.com/KKamJi98/image-converter/commit/9f6e26a405eb3157d1839508e03d5121b2ae1522))
* update backend Dockerfile to copy README.md before poetry install ([4ab0faa](https://github.com/KKamJi98/image-converter/commit/4ab0faac69dfdbe72b2c0a6fa71b262f9281971e))
* Update backend Dockerfile to upgrade system packages for CVEs ([4e1e04b](https://github.com/KKamJi98/image-converter/commit/4e1e04ba0b7b429c1f254752d211921951c4fea6))


### Performance Improvements

* constrain vips cache growth ([ec001a6](https://github.com/KKamJi98/image-converter/commit/ec001a658f747ee58778ffebbcd123a69fc8611e))
* optimize conversion pipeline and enable libvips by default ([22ad6ad](https://github.com/KKamJi98/image-converter/commit/22ad6ad014a517cbf22ff2d11340b9183253f99c))


### Documentation

* add comprehensive API specification and documentation structure ([37fa755](https://github.com/KKamJi98/image-converter/commit/37fa755fd167aa0e73b0b86321c55f7eae8d38b5))
* update guidelines and readme ([2131388](https://github.com/KKamJi98/image-converter/commit/2131388a83317dcfcca396779ac912b881c66fac))
