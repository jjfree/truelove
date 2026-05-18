import { Module } from "@nestjs/common";
import { InMemoryStore } from "./in-memory-store";

@Module({
  providers: [
    {
      provide: InMemoryStore,
      useFactory: () => InMemoryStore.withSeedData()
    }
  ],
  exports: [InMemoryStore]
})
export class DataModule {}
